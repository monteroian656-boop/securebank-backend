-- role_change_entries.roleId no tenía foreign key hacia roles, a
-- diferencia de todas las demás tablas del esquema — un descuido que
-- permitía filas huérfanas si algún día se borra un rol. Se agrega acá
-- (no se edita la migración inicial ya aplicada).
ALTER TABLE "role_change_entries"
  ADD CONSTRAINT "role_change_entries_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "role_change_entries_roleId_idx" ON "role_change_entries"("roleId");
