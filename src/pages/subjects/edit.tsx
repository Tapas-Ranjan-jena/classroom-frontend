import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "@refinedev/react-hook-form";
import { useList } from "@refinedev/core";
import { Department } from "@/types";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const subjectSchema = z.object({
    departmentId: z.coerce.number().min(1, "Department is required"),
    code: z.string().min(2, "Subject code is required"),
    name: z.string().min(2, "Subject name is required"),
    description: z.string().optional(),
});

export default function SubjectsEdit() {
    const { query: departmentsQuery } = useList<Department>({
        resource: "departments",
        pagination: { pageSize: 100 }
    });

    const departmentsList = departmentsQuery?.data?.data || [];

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        refineCoreProps: {
            resource: "subjects",
            action: "edit",
            redirect: "list",
        }
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        try {
            await onFinish(values);
        } catch (err) {
            console.error("Error updating subject", err);
        }
    };

    return (
        <EditView>
            <Breadcrumb />
            <h1 className="page-title">Edit Subject</h1>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mt-4">
                    <FormField
                        control={control}
                        name="departmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departmentsList.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name} ({dept.code})
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
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="CS101..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Data Structures & Algorithms" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Syllabus overview..." {...field} />
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
