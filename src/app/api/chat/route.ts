/**
 * 🧠 CEREBRO DEL AGENTE (ORQUESTADOR API)
 * 
 * Este archivo es el servidor que recibe los mensajes del usuario, 
 * consulta a la Inteligencia Artificial (Gemini) y ejecuta las herramientas
 * (Tools) si el Agente decide que es necesario (x402, ERC-8004).
 */

import { GoogleGenAI } from '@google/genai';
import { getSystemContext, AgentRole } from '@/lib/agents/prompts';
import { 
    scanGeofenceTool,
    executePaymentRoutingTool,
    executeScanGeofence,
    executePaymentRouting
} from '@/lib/agents/tools';

// Permitir funciones largas (hasta 60 segundos) ya que la IA puede tardar en pensar.
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        // 1. RECIBIR LA PETICIÓN
        // Obtenemos los mensajes, el rol (CIVIL o CAJERO) y los metadatos (billetera del usuario).
        const { messages, agentRole = "CIVIL", sessionMetadata = {} } = await req.json();

        // 2. INICIALIZAR EL MODELO (Google Gemini)
        // Usamos el SDK oficial de Google. Requiere GEMINI_API_KEY en el archivo .env
        const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            apiVersion: 'v1beta'
        });

        const modelId = 'gemini-flash-latest'; // Modelo rápido, ideal para agentes
        
        // Obtenemos la personalidad y las instrucciones estrictas según el rol
        const systemInstructionText = getSystemContext(agentRole as AgentRole, sessionMetadata);

        // Formateamos los mensajes al formato que entiende Gemini
        const contents = messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // 3. CARGAR HERRAMIENTAS (SKILLS)
        // Le pasamos los schemas (ERC-8004 y x402) al agente para que sepa qué puede hacer.
        const tools = [
            {
                functionDeclarations: [
                    scanGeofenceTool,           // Para identidad/reputación (CIVIL)
                    executePaymentRoutingTool   // Para micropagos x402 (CAJERO)
                ]
            }
        ];

        // 4. GENERAR RESPUESTA (STREAMING)
        // Pedimos a Gemini que responda. "Streaming" significa que recibiremos
        // la respuesta pedazo por pedazo (como cuando ChatGPT escribe).
        const responseStream = await ai.models.generateContentStream({
            model: modelId,
            contents: contents,
            config: {
                systemInstruction: systemInstructionText,
                tools: tools as any,
            }
        });

        // 5. PROCESAR Y ENVIAR RESPUESTA AL FRONTEND
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        // A. Si el agente solo quiere hablar (texto normal)
                        if (chunk.text) {
                            controller.enqueue(new TextEncoder().encode(chunk.text));
                        }

                        // B. Si el agente decide usar una Herramienta (Ejecución On-Chain)
                        if (chunk.functionCalls) {
                            for (const call of chunk.functionCalls) {
                                let result;
                                
                                // El PASE DE RELEVO: Ejecutamos el código real basado en su decisión
                                if (call.name === 'scan_geofence_activity') {
                                    // Pasa los argumentos al simulador de ERC-8004
                                    result = await executeScanGeofence(call.args);
                                }
                                if (call.name === 'execute_payment_routing') {
                                    // Pasa los argumentos al simulador de x402
                                    result = await executePaymentRouting(call.args);
                                }
                                
                                // Le decimos al frontend qué pasó enviando un JSON
                                controller.enqueue(new TextEncoder().encode(`\n[EJECUCIÓN ON-CHAIN]: ${JSON.stringify(result)}\n`));
                            }
                        }
                    }
                } catch (e: any) {
                    controller.enqueue(new TextEncoder().encode(`\n[Error en Stream]: ${e.message}`));
                } finally {
                    controller.close(); // Terminamos la conexión
                }
            }
        });

        // Retornamos el Stream al frontend para que el React hook lo lea
        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error: any) {
        console.error("Error crítico en el Cerebro:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
