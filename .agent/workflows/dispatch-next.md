---
description: Descompone el objetivo actual del MVP en 3–6 Task Packets listos para copiar/pegar y asignar a agentes (UI/DB/Wahoo/LLM/QA), con dependencias, PASS/FAIL y evidencia
---

## Instrucciones
Descompón el objetivo actual en 3–6 Task Packets (uno por agente) con dependencias claras y criterios de validación.

### Input
- fase actual + objetivo

### Output (formato obligatorio)
Devuelve una lista ordenada de Task Packets. Cada Task Packet debe incluir:

- **Owner agent**
- **Goal**
- **Scope**
- **Out of scope**
- **Dependencies**
- **Steps (checklist)**
- **Artifacts (files/paths)**
- **PASS/FAIL checks**
- **Evidence to attach**

### Reglas
- No implementes código. Solo coordina.
- Prioriza rutas críticas para MVP: Calendar persistente → Wahoo import/export → LLM plan/chat → QA gates.
- Si detectas bloqueos (credenciales, tablas, endpoints), crea un Task Packet específico para resolverlos.