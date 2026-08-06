import React, { useEffect, useState, useCallback } from "react";
import { useShow, useList } from "@refinedev/core";
import { ClassDetails, Enrollment, User } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary";
import { BACKEND_BASE_URL } from "@/constants";
import { Copy, Check, UserPlus, UserMinus, AlertTriangle, Users, Key } from "lucide-react";

const Show = () => {
    const { query } = useShow<ClassDetails>({ resource: "classes" });
    const classDetails = query.data?.data;
    const { isLoading, isError } = query;

    const [enrollmentsList, setEnrollmentsList] = useState<Enrollment[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [enrolling, setEnrolling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch all available students for enrollment modal
    const { query: studentsQuery } = useList<User>({
        resource: "users",
        filters: [{ field: "role", operator: "eq", value: "student" }],
        pagination: { pageSize: 100 },
    });
    const allStudents = studentsQuery?.data?.data || [];

    const fetchEnrollments = useCallback(async () => {
        if (!classDetails?.id) return;
        setLoadingEnrollments(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments/class/${classDetails.id}`);
            if (res.ok) {
                const json = await res.json();
                setEnrollmentsList(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch enrollments", err);
        } finally {
            setLoadingEnrollments(false);
        }
    }, [classDetails?.id]);

    useEffect(() => {
        if (classDetails?.id) {
            fetchEnrollments();
        }
    }, [classDetails?.id, fetchEnrollments]);

    const handleCopyInviteCode = () => {
        if (classDetails?.inviteCode) {
            navigator.clipboard.writeText(classDetails.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleEnrollStudent = async () => {
        if (!selectedStudentId || !classDetails?.id) return;
        setEnrolling(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId: classDetails.id, studentId: selectedStudentId }),
            });
            if (res.ok) {
                setSelectedStudentId("");
                setDialogOpen(false);
                fetchEnrollments();
            } else {
                const errJson = await res.json();
                alert(errJson.error || "Failed to enroll student");
            }
        } catch (err) {
            console.error("Error enrolling student", err);
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenrollStudent = async (enrollmentId: number, studentName: string) => {
        if (!confirm(`Are you sure you want to unenroll ${studentName}?`)) return;
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments/${enrollmentId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchEnrollments();
            } else {
                alert("Failed to unenroll student");
            }
        } catch (err) {
            console.error("Error unenrolling student", err);
        }
    };

    if (isLoading || isError || !classDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="classes" title="Class Details" />
                <p className="state-message p-6 text-center text-muted-foreground">
                    {isLoading
                        ? "Loading class details..."
                        : isError
                            ? "Failed to load class details..."
                            : "Class details not found"}
                </p>
            </ShowView>
        );
    }

    const teacherName = classDetails.teacher?.name ?? "Unknown Instructor";

    const teachersInitials = teacherName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
        teachersInitials || "NA"
    )}`;

    const enrolledCount = enrollmentsList.length;
    const maxCapacity = classDetails.capacity || 50;
    const capacityPercentage = Math.round((enrolledCount / maxCapacity) * 100);
    const isWarningCapacity = capacityPercentage >= 80;
    const isFull = enrolledCount >= maxCapacity;

    // Filter out students who are already enrolled
    const enrolledStudentIds = new Set(enrollmentsList.map(e => e.student?.id));
    const availableStudentsToEnroll = allStudents.filter(s => !enrolledStudentIds.has(s.id));

    return (
        <ShowView className="class-view class-show space-y-6 max-w-5xl mx-auto p-4">
            <ShowViewHeader resource="classes" title="Class Details" />

            {/* Banner Header */}
            <div className="banner rounded-xl overflow-hidden shadow-sm border bg-muted max-h-64 relative">
                {classDetails.bannerUrl ? (
                    <AdvancedImage
                        alt="Class Banner"
                        cldImg={bannerPhoto(classDetails.bannerCldPubId ?? '', classDetails.name)}
                        className="w-full h-64 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center p-6 text-white">
                        <h1 className="text-3xl font-bold">{classDetails.name}</h1>
                    </div>
                )}
            </div>

            {/* Details Card */}
            <Card className="details-card p-6 space-y-6">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{classDetails.name}</h1>
                        <p className="text-muted-foreground mt-1">{classDetails.description || "No description provided."}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                            {enrolledCount} / {maxCapacity} Spots Enrolled
                        </Badge>
                        <Badge
                            variant={classDetails.status === "active" ? "default" : "secondary"}
                            className="px-3 py-1 text-sm capitalize"
                        >
                            {classDetails.status}
                        </Badge>
                    </div>
                </div>

                {/* Capacity Progress Warning Bar */}
                <div className="space-y-2 bg-muted/40 p-4 rounded-lg border">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-blue-500" />
                            Class Enrollment Capacity
                        </span>
                        <span className="flex items-center gap-2">
                            {capacityPercentage}% Filled
                            {isWarningCapacity && (
                                <Badge variant="destructive" className="flex items-center gap-1 text-[11px] px-2 py-0.5">
                                    <AlertTriangle className="h-3 w-3" />
                                    {isFull ? "Class Full" : "High Capacity"}
                                </Badge>
                            )}
                        </span>
                    </div>
                    <Progress
                        value={capacityPercentage}
                        className={`h-2.5 ${isFull ? "[&>div]:bg-red-600" : isWarningCapacity ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-600"}`}
                    />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="instructor border rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instructor / Teacher</p>
                        <div className="flex items-center gap-3 pt-1">
                            <img
                                src={classDetails.teacher?.image ?? placeholderUrl}
                                alt={teacherName}
                                className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div>
                                <p className="font-semibold text-foreground">{teacherName}</p>
                                <p className="text-xs text-muted-foreground">{classDetails.teacher?.email || "No email available"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="department border rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department & Subject</p>
                        <div>
                            <p className="font-semibold text-foreground">{classDetails.department?.name || "General Department"}</p>
                            <p className="text-xs text-muted-foreground">Subject: {classDetails.subject?.name || "N/A"} ({classDetails.subject?.code || "N/A"})</p>
                        </div>
                    </div>
                </div>

                {/* Invite Code Box */}
                <div className="border rounded-lg p-4 bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-lg">
                            <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Class Invite Code</p>
                            <p className="font-mono text-lg font-bold text-foreground tracking-wider">{classDetails.inviteCode || "N/A"}</p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleCopyInviteCode} className="gap-2">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy Code"}
                    </Button>
                </div>

                <Separator />

                {/* Enrollment Management Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold">Enrolled Students ({enrolledCount})</h2>
                            <p className="text-xs text-muted-foreground">Students active in this class cohort</p>
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={isFull} className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Enroll Student
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Enroll Student to Class</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-3">
                                    <p className="text-sm text-muted-foreground">Select a student from the system roster to enroll in {classDetails.name}.</p>
                                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select student..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {availableStudentsToEnroll.length === 0 ? (
                                                <SelectItem value="none" disabled>No remaining students available</SelectItem>
                                            ) : (
                                                availableStudentsToEnroll.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name} ({s.email})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={handleEnrollStudent}
                                        disabled={!selectedStudentId || enrolling}
                                        className="w-full mt-2"
                                    >
                                        {enrolling ? "Enrolling..." : "Confirm Enrollment"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Enrolled Table */}
                    <div className="border rounded-lg overflow-hidden">
                        {loadingEnrollments ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">Loading enrolled students...</p>
                        ) : enrollmentsList.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">No students currently enrolled in this class.</p>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-xs font-semibold uppercase text-muted-foreground border-b">
                                    <tr>
                                        <th className="py-3 px-4">Student Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Enrolled Date</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollmentsList.map(({ enrollmentId, student, enrolledAt }) => (
                                        <tr key={enrollmentId} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                            <td className="py-3 px-4 flex items-center gap-3">
                                                <img
                                                    src={student?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student?.name || "Student")}`}
                                                    alt={student?.name}
                                                    className="w-8 h-8 rounded-full border object-cover"
                                                />
                                                <span className="font-medium text-foreground">{student?.name || "Unknown"}</span>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{student?.email || "N/A"}</td>
                                            <td className="py-3 px-4 text-xs text-muted-foreground">
                                                {enrolledAt ? new Date(enrolledAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 text-xs"
                                                    onClick={() => handleUnenrollStudent(enrollmentId, student?.name || "this student")}
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                    Unenroll
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </Card>
        </ShowView>
    );
};

export default Show;