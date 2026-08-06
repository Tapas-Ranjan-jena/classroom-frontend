import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "@refinedev/react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadWidget from "@/components/upload-widget";

const userCreateSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["student", "teacher", "admin"]),
    image: z.string().optional(),
    imageCldPubId: z.string().optional(),
});

export default function UsersCreate() {
    const form = useForm({
        resolver: zodResolver(userCreateSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "student",
            image: "",
            imageCldPubId: "",
        },
        refineCoreProps: {
            resource: "users",
            redirect: "list",
        }
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        try {
            await onFinish(values);
        } catch (err) {
            console.error("Error creating user", err);
        }
    };

    return (
        <CreateView>
            <Breadcrumb />
            <h1 className="page-title">Add New User</h1>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mt-4">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="imageCldPubId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Avatar Image (Cloudinary)</FormLabel>
                                <FormControl>
                                    <UploadWidget
                                        value={field.value ? { url: form.getValues("image") || "", publicId: field.value } : null}
                                        onChange={(val) => {
                                            field.onChange(val?.publicId || "");
                                            form.setValue("image", val?.url || "");
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Creating User..." : "Create User"}
                    </Button>
                </form>
            </Form>
        </CreateView>
    );
}
