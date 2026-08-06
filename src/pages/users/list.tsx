import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Search, UserCheck, Shield, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import { User, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDelete, useNavigation } from "@refinedev/core";

export default function UsersList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    const { mutate: deleteUser } = useDelete();
    const { edit } = useNavigation();

    const roleFilters = selectedRole === 'all' ? [] : [
        { field: 'role', operator: 'eq' as const, value: selectedRole }
    ];
    const searchFilters = searchQuery ? [
        { field: 'search', operator: 'contains' as const, value: searchQuery }
    ] : [];

    const userColumns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: 'avatar',
            accessorKey: 'image',
            size: 60,
            header: () => <p className="column-title ml-2">Avatar</p>,
            cell: ({ row }) => (
                <div className="flex items-center justify-center ml-2">
                    <img
                        src={row.original.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.original.name)}`}
                        alt={row.original.name}
                        className="w-9 h-9 rounded-full object-cover border"
                    />
                </div>
            )
        },
        {
            id: 'name',
            accessorKey: 'name',
            size: 200,
            header: () => <p className="column-title">Name</p>,
            cell: ({ getValue }) => <span className="text-foreground font-medium">{getValue<string>()}</span>,
        },
        {
            id: 'email',
            accessorKey: 'email',
            size: 220,
            header: () => <p className="column-title">Email</p>,
            cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>,
        },
        {
            id: 'role',
            accessorKey: 'role',
            size: 120,
            header: () => <p className="column-title">Role</p>,
            cell: ({ getValue }) => {
                const role = getValue<UserRole>();
                const variant = role === UserRole.ADMIN ? "destructive" : role === UserRole.TEACHER ? "default" : "secondary";
                return (
                    <Badge variant={variant} className="capitalize">
                        {role}
                    </Badge>
                );
            }
        },
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            size: 150,
            header: () => <p className="column-title">Joined Date</p>,
            cell: ({ getValue }) => (
                <span className="text-muted-foreground text-xs">
                    {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString() : 'N/A'}
                </span>
            ),
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
                        onClick={() => edit("users", row.original.id)}
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${row.original.name}?`)) {
                                deleteUser({ resource: "users", id: row.original.id });
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        }
    ], [deleteUser, edit]);

    const userTable = useTable<User>({
        columns: userColumns,
        refineCoreProps: {
            resource: 'users',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...roleFilters, ...searchFilters]
            },
        }
    });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Users Management</h1>

            <div className="intro-row">
                <p>Manage system users, teachers, students, and admin roles.</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Students</SelectItem>
                                <SelectItem value="teacher">Teachers</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                            </SelectContent>
                        </Select>

                        <CreateButton resource="users" />
                    </div>
                </div>
            </div>

            <DataTable table={userTable} />
        </ListView>
    );
}
