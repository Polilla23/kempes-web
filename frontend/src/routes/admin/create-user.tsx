import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/create-user')({
    component: CreateUserPage,
});

function CreateUserPage() {
    return <div className="text-2xl font-bold">Crear Usuario</div>
}

export default CreateUserPage;