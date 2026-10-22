import React from "react";

export default function ModalEdicion({
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  categories,
  handleUpdateTorneo
}) {
  // Si el modal no está activo, no renderiza nada en el DOM
  if (!isEditing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg">
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-lg font-bold text-foreground">Editar Parámetros del Torneo</h3>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-muted-foreground hover:text-foreground text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Formulario de Edición */}
        <form onSubmit={handleUpdateTorneo} className="space-y-4">
          {/* Nombre del Torneo */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Nombre del Torneo
            </label>
            <input
              type="text"
              value={editForm.nombre_torneo}
              onChange={(e) => setEditForm({ ...editForm, nombre_torneo: e.target.value })}
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
              required
            />
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={editForm.fecha_inicio}
              onChange={(e) => setEditForm({ ...editForm, fecha_inicio: e.target.value })}
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Categoría
            </label>
            <select
              value={editForm.categoria}
              onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
              required
            >
              <option value="">Selecciona tu categoría</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option 
                    key={cat.id_categoria || cat.id} 
                    value={cat.id_categoria || cat.id}
                  >
                    {cat.nombre_categoria || cat.nombre || `Categoría ${cat.id_categoria || cat.id}`}
                  </option>
                ))
              ) : (
                <option disabled>Cargando categorías...</option>
              )}
            </select>
          </div>

          {/* Rama */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Rama
            </label>
            <select
              value={editForm.rama_torneo}
              onChange={(e) => setEditForm({ ...editForm, rama_torneo: e.target.value })}
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
            >
              <option value="Varonil">Varonil</option>
              <option value="Femenil">Femenil</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>

          {/* Número de Canchas Disponibles */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Número de Canchas Disponibles
            </label>
            <input
              type="number"
              min="1"
              value={editForm.canchas_disponibles}
              onChange={(e) => {
                const val = e.target.value;
                setEditForm({
                  ...editForm,
                  canchas_disponibles: val === '' ? '' : parseInt(val, 10)
                });
              }}
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
              required
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}