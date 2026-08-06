export type Subject = {
    id: number;
    name: string;
    code: string;
    description: string;
    departmentId?: number;
    department?: Department | string;
    createdAt?: string;
};

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CreateResponse<T = unknown> = {
    data?: T;
};

export type GetOneResponse<T = unknown> = {
    data?: T;
};

declare global {
    interface CloudinaryUploadWidgetResults {
        event: string;
        info: {
            secure_url: string;
            public_id: string;
            delete_token?: string;
            resource_type: string;
            original_filename: string;
        };
    }

    interface CloudinaryWidget {
        open: () => void;
    }

    interface Window {
        cloudinary?: {
            createUploadWidget: (
                options: Record<string, unknown>,
                callback: (
                    error: unknown,
                    result: CloudinaryUploadWidgetResults
                ) => void
            ) => CloudinaryWidget;
        };
    }
}

export interface UploadWidgetValue {
    url: string;
    publicId: string;
}

export interface UploadWidgetProps {
    value?: UploadWidgetValue | null;
    onChange?: (value: UploadWidgetValue | null) => void;
    disabled?: boolean;
}

export enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin",
}

export type User = {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    imageCldPubId?: string;
    department?: string;
};

export type Schedule = {
    day: string;
    startTime: string;
    endTime: string;
};

export type Department = {
    id: number;
    code?: string;
    name: string;
    description: string;
    createdAt?: string;
};

export type ClassDetails = {
    id: number;
    name: string;
    description: string;
    status: "active" | "inactive" | "archived";
    capacity: number;
    courseCode?: string;
    courseName?: string;
    bannerUrl?: string;
    bannerCldPubId?: string;
    subjectId?: number;
    teacherId?: string;
    subject?: Subject;
    teacher?: User;
    department?: Department;
    schedules: Schedule[];
    inviteCode?: string;
    createdAt?: string;
};

export type Enrollment = {
    enrollmentId: number;
    enrolledAt: string;
    student: User;
};

export type DashboardStats = {
    metrics: {
        totalUsers: number;
        totalDepartments: number;
        totalSubjects: number;
        totalClasses: number;
        activeClasses: number;
        totalEnrollments: number;
    };
    charts: {
        userDistribution: { role: string; count: number }[];
        classesByDepartment: { department: string; count: number }[];
        capacityStatus: {
            id: number;
            className: string;
            enrolled: number;
            capacity: number;
            fillPercentage: number;
            isWarning: boolean;
        }[];
        enrollmentTrends: { name: string; students: number; capacity: number }[];
    };
    activityFeed: {
        recentEnrollments: { id: number; createdAt: string; studentName: string; className: string }[];
        recentClasses: { id: number; name: string; createdAt: string; teacherName: string }[];
    };
};

export type SignUpPayload = {
    email: string;
    name: string;
    password: string;
    image?: string;
    imageCldPubId?: string;
    role: UserRole;
};