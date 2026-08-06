import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@refinedev/react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const deptSchema = z.object({
    code: z.string().min(2, "Department code is required"),
    name: z.string().min(2, "Department name is required"),
    description: z.string().optional(),
});

export default function DepartmentsEdit() {
    const form = useForm({
        resolver: zodResolver(deptSchema),
        refineCoreProps: {
            resource: "departments",
            action: "edit",
            redirect: "list",
        }
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        try {
            await onFinish(values);
        } catch (err) {
            console.error("Error updating department", err);
        }
    };

    return (
        <EditView>
            <Breadcrumb />
            <h1 className="page-title">Edit Department</h1>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mt-4">
                    <FormField
                        control={control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="CS, EE, ME..." {...field} />
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
                                <FormLabel>Department Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Computer Science & Engineering" {...field} />
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
                                    <Textarea placeholder="Overview of department domain..." {...field} />
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
