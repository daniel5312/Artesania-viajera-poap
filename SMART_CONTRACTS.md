# 📜 Artesanía Viajera - Documentación Técnica de Smart Contracts

Esta documentación detalla los contratos inteligentes desplegados en **Celo Mainnet** para el proyecto **Artesanía Viajera**. Esta información es útil para la documentación del repositorio, auditorías y para perfiles profesionales en plataformas como **Talent Protocol**.

---

## 🏗️ Resumen de la Arquitectura
El sistema utiliza una arquitectura modular diseñada para la eficiencia en gas y la escalabilidad, centrada en la identidad digital del viajero y la trazabilidad del impacto social.

- **Red:** Celo Mainnet
- **Chain ID:** 42220
- **Versión de Solidity:** 0.8.28 (Optimizaciones nativas de manejo de memoria)
- **Framework de Desarrollo:** Foundry

---

## 📄 Contratos Inteligentes

### 1. 🛂 Artesanía Passport (ERC-721)
El núcleo de la identidad del viajero. Es un NFT (ERC-721) que actúa como un pasaporte digital donde se registran los "Momentos" (visitas a talleres artesanales).

- **Dirección:** `0xF62d9Ed4243c08C0191C62ac5dA9F77abC7559b5`
- **Símbolo:** `AVP`
- **TX de Despliegue:** [0x3e1d97...039c](https://celoscan.io/tx/0x3e1d97075eb753a0b82106af4d2e104384273dabb53bb3cd6662c91fbcd2039c)
- **Características Técnicas:**
  - Uso de `ERC721URIStorage` para metadatos dinámicos vinculados a IPFS/Pinata.
  - Lógica híbrida para acuñación de momentos vinculados a la experiencia del usuario.

### 2. 🛡️ Artesanía Badge (ERC-1155)
Sistema de insignias coleccionables que representan logros o rutas completadas por los artesanos y viajeros.

- **Dirección:** `0x77fb775be55fdfae9ed98c82665f1ab1bf19de7d`
- **TX de Despliegue:** [0x55f203...941e](https://celoscan.io/tx/0x55f203b5dd1da9f014e74da2a53f352e560743a3ade9ef96a64c52e7380f941e)
- **Características Técnicas:**
  - Implementación ultra-optimizada que evita el uso de contadores en Storage (Manual ID Ranges).
  - Mapeos privados para reducción de gas en lectura.
  - Compatible con el estándar multi-token ERC-1155.

### 3. 🗃️ Artesanía Registry
Contrato de registro global optimizado para almacenar la historia de los momentos capturados sin incurrir en altos costos de gas.

- **Dirección:** `0xdBeb54D9c5E9fFC7e3a31d857b31bFA1C244b16F`
- **TX de Despliegue:** [0x569b86...9b7f](https://celoscan.io/tx/0x569b86ba13350fb28b49b9bd3a05e2c7dc9194cdce537491338786ffecdb9b7f)
- **Características Técnicas:**
  - Uso intensivo de `immutable` y `calldata` para costo de gas cercano a cero en operaciones constantes.
  - Implementación de **Storage Packing** (uint40 para fechas) para optimizar slots de almacenamiento.
  - Validación de membresía cruzada con el Passport.

### 4. 🌱 ReFi Splitter (Motor de Economía Circular)
Contrato encargado de la distribución automática de fondos para generar impacto social y sostenibilidad del proyecto.

- **Collective Splitter:** `0xe2f221a0d6bb28e95d82caffc1d08875b3316174`
- **Treasury Splitter:** `0x8ab653440cef8f4fcf4780b2835f0265b6431392`
- **Características Técnicas:**
  - Lógica de repartición del **2% (REFI_FEE)** para bienes comunes.
  - Uso de **Custom Errors** en lugar de strings de requerimiento para ahorrar gas en transacciones fallidas.
  - Trazabilidad total de impacto mediante eventos indexados (`ImpactGenerated`).

---

## 🛠️ Stack Tecnológico para Talent Protocol
Si vas a incluir esto en tu perfil de **Talent Protocol**, te sugiero destacar:
- **Solidity 0.8.28:** Demuestra estar a la vanguardia de las actualizaciones de seguridad de Ethereum.
- **Gas Optimization:** El uso de `uint40`, `immutable` y `calldata` muestra habilidades avanzadas de ingeniería.
- **Celo Eco-system:** Enfoque en ReFi (Finanzas Regenerativas) y economía circular.
- **Interoperabilidad:** Uso de estándares ERC-721 y ERC-1155 integrados en un ecosistema unificado.
