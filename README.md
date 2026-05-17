# Recovery Atlas AI

App web para registrar comidas, entrenamientos de fuerza y estimar recuperación muscular en un cuerpo 3D interactivo.

## Incluye

- Calendario diario de comida, calorías, macros y suplementos.
- Calendario de entrenamientos de fuerza con series, reps, carga, RPE y duración.
- Simulación de sincronización Huawei Health para pasos, sueño, calorías activas y cardio.
- Motor local de recuperación por músculo con sinergias entre grupos musculares.
- Cuerpo 3D interactivo con colores por desgaste: rojo, naranjo, amarillo, verde claro y verde.
- Coach IA local con payload estructurado listo para enviar a un LLM real desde backend.

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Integración real futura

- Huawei: conectar por Huawei Health Kit o Health Connect con OAuth/consentimiento del usuario.
- LLM: crear un endpoint backend `/api/coach` que reciba el payload de `buildLLMPayload` y llame al proveedor elegido.
- Salud: mantener siempre el lenguaje como estimación de entrenamiento, no diagnóstico médico.

## Créditos 3D

El modelo muscular en `public/models/z-anatomy-fitness-muscles.glb` deriva de Z-Anatomy y BodyParts3D. Ver `public/models/ATTRIBUTION.md`.
