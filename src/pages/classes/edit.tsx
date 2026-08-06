import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "@refinedev/react-hook-form";
import { useList } from "@refinedev/core";
import { Subject, User } from "@/types";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadWidget from "@/components/upload-widget";

const classEditSchema = z.object({
    name: z.string().min(2, "Class name is required"),
    description: z.string().optional(),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    status: z.enum(["active", "inactive", "archived"]),
    subjectId: z.coerce.number().min(1, "Subject is required"),
    teacherId: z.string().min(1, "Teacher is required"),
    bannerUrl: z.string().optional(),
    bannerCldPubId: z.string().optional(),
});

export default function ClassesEdit() {
    const { query: subjectsQuery } = useList<Subject>({
        resource: "subjects",
        pagination: { pageSize: 100 }
    });

    const { query: teachersQuery } = useList<User>({
        resource: "users",
        filters: [{ field: "role", operator: "eq", value: "teacher" }],
        pagination: { pageSize: 100 }
    });

    const subjectsList = subjectsQuery?.data?.data || [];
    const teachersList = teachersQuery?.data?.data || [];

    const form = useForm({
        resolver: zodResolver(classEditSchema),
        refineCoreProps: {
            resource: "classes",
            action: "edit",
            redirect: "list",
        }
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        try {
            await onFinish(values);
        } catch (err) {
            console.error("Error updating class", err);
        }
    };

    return (
        <EditView>
            <Breadcrumb />
            <h1 className="page-title">Edit Class</h1>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mt-4">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Advanced Web Engineering - Fall 2026" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="subjectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjectsList.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                {sub.name} ({sub.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="teacherId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teacher / Instructor</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Assign Instructor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {teachersList.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name} ({t.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Capacity</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Overview and objectives..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="bannerCldPubId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banner Image (Cloudinary)</FormLabel>
                                <FormControl>
                                    <UploadWidget
                                        value={field.value ? { url: form.getValues("bannerUrl") || "", publicId: field.value } : null}
                                        onChange={(val) => {
                                            field.onChange(val?.publicId || "");
                                            form.setValue("bannerUrl", val?.url || "");
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Saving Changes..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </EditView>
    );
}
