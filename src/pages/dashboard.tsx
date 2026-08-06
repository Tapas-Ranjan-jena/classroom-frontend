import { useEffect, useState } from "react";
import { BACKEND_BASE_URL } from "@/constants";
import { DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, BookOpen, GraduationCap, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const ROLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${BACKEND_BASE_URL}/dashboard/stats`);
                if (res.ok) {
                    const json = await res.json();
                    setStats(json.data);
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading dashboard analytics...</p>
            </div>
        );
    }

    const metrics = stats?.metrics;
    const charts = stats?.charts;
    const activity = stats?.activityFeed;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Classroom Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    System-wide overview, capacity status, and real-time activity metrics.
                </p>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalUsers ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered Accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
                        <Building2 className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalDepartments ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Academic Departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Subjects & Courses</CardTitle>
                        <BookOpen className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalSubjects ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Curriculum Subjects</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Classes</CardTitle>
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.activeClasses ?? 0} / {metrics?.totalClasses ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics?.totalEnrollments ?? 0} Total Enrollments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 4 Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Enrollment Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            Class Enrollment Trends
                        </CardTitle>
                        <CardDescription>Enrolled students vs max capacity across classes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts?.enrollmentTrends ?? []}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <Tooltip />
                                <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Enrolled" />
                                <Area type="monotone" dataKey="capacity" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="Max Capacity" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chart 2: Classes by Department */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-500" />
                            Classes by Department
                        </CardTitle>
                        <CardDescription>Distribution of active classes per academic department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts?.classesByDepartment ?? []}>
                                <XAxis dataKey="department" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Classes Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chart 3: User Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-500" />
                            User Roles Distribution
                        </CardTitle>
                        <CardDescription>Breakdown of registered students, teachers, and admins</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts?.userDistribution ?? []}
                                    dataKey="count"
                                    nameKey="role"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ role, count }) => `${role}: ${count}`}
                                >
                                    {(charts?.userDistribution ?? []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chart 4: Capacity Status Warnings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Capacity Utilization & Warnings
                        </CardTitle>
                        <CardDescription>Live seat fill rates across active classes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                        {(charts?.capacityStatus ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No active classes found.</p>
                        ) : (
                            charts?.capacityStatus.map((cls) => (
                                <div key={cls.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{cls.className}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {cls.enrolled} / {cls.capacity} ({cls.fillPercentage}%)
                                            {cls.isWarning && (
                                                <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">High Capacity</Badge>
                                            )}
                                        </span>
                                    </div>
                                    <Progress
                                        value={cls.fillPercentage}
                                        className={cls.isWarning ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Recent Student Enrollments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(activity?.recentEnrollments ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent enrollments.</p>
                        ) : (
                            activity?.recentEnrollments.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-foreground">{item.studentName || 'Student'}</p>
                                        <p className="text-xs text-muted-foreground">Enrolled in {item.className}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                            Recently Created Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(activity?.recentClasses ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent classes created.</p>
                        ) : (
                            activity?.recentClasses.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Teacher: {item.teacherName || 'Unassigned'}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}