import { createFileRoute } from '@tanstack/react-router';
import { checkAuth } from '../auth';

export const Route = createFileRoute('/admin/create-user')({
    beforeLoad: async ({ location }) => {
        await checkAuth(location);
    },
    component: CreateUserPage,
});

function CreateUserPage() {
    return <div className="text-2xl font-bold">Crear Usuario</div>
}

export default CreateUserPage;