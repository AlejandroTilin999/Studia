import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import { Card, CardContent } from '@/Components/ui/card';
import { useEffect } from 'react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.rol || 'admin';

    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;

        const originalPadding = mainEl.style.padding;
        mainEl.style.padding = '0';

        return () => {
            mainEl.style.padding = originalPadding;
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Mi Perfil" />

            <PageHeaderBanner
                title="Configuración de Perfil"
                subtitle="Gestiona la información de tu cuenta, seguridad y preferencias del sistema."
                breadcrumb={`${role.toUpperCase()} / PERFIL`}
            />

            <div className="p-4 md:p-8 space-y-6 max-w-5xl">
                <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </CardContent>
                </Card>

                <Card className="border-rose-50 border-2 shadow-sm rounded-xl overflow-hidden bg-rose-50/10">
                    <CardContent className="p-6 md:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
