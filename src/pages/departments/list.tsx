import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Search, Edit, Trash2, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import { Department } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDelete, useNavigation } from "@refinedev/core";

export default function DepartmentsList() {
    const [searchQuery, setSearchQuery] = useState('');

    const { mutate: deleteDept } = useDelete();
    const { edit } = useNavigation();

    const searchFilters = searchQuery ? [
        { field: 'search', operator: 'contains' as const, value: searchQuery }
    ] : [];

    const deptColumns = useMemo<ColumnDef<Department>[]>(() => [
        {
            id: 'code',
            accessorKey: 'code',
            size: 100,
            header: () => <p className="column-title">Code</p>,
            cell: ({ getValue }) => <span className="font-semibold text-primary">{getValue<string>() || 'N/A'}</span>,
        },
        {
            id: 'name',
            accessorKey: 'name',
            size: 250,
            header: () => <p className="column-title">Department Name</p>,
            cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue<string>()}</span>,
        },
        {
            id: 'description',
            accessorKey: 'description',
            size: 300,
            header: () => <p className="column-title">Description</p>,
            cell: ({ getValue }) => <span className="text-muted-foreground text-sm">{getValue<string>() || 'No description'}</span>,
        },
        {
            id: 'actions',
            size: 120,
            header: () => <p className="column-title">Actions</p>,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => edit("departments", row.original.id)}
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (confirm(`Delete department ${row.original.name}?`)) {
                                deleteDept({ resource: "departments", id: row.original.id });
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        }
    ], [deleteDept, edit]);

    const deptTable = useTable<Department>({
        columns: deptColumns,
        refineCoreProps: {
            resource: 'departments',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...searchFilters]
            },
        }
    });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Departments</h1>

            <div className="intro-row">
                <p>Manage academic departments and faculties.</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by code or name..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <CreateButton resource="departments" />
                </div>
            </div>

            <DataTable table={deptTable} />
        </ListView>
    );
}
