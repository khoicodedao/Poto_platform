import { ClassNavTabs } from "@/components/class-nav-tabs";
import { getClassById } from "@/lib/actions/classes";

export default async function ClassLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const classId = parseInt(params.id);
    const classData = await getClassById(classId);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white sticky top-[60px] z-10 shadow-sm">
                <ClassNavTabs className={classData?.name} />
            </div>
            {children}
        </div>
    );
}
