import { Subject } from "../types";

export const MOCK_SUBJECTS: Subject[] = [
    {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science",
        department: "CS",
        description: "An introductory course covering programming fundamentals, algorithms, and problem-solving techniques.",
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        code: "MATH201",
        name: "Calculus II",
        department: "Math",
        description: "Advanced study of integration techniques, sequences, series, and their applications.",
        createdAt: new Date().toISOString(),
    },
    {
        id: 3,
        code: "ENG102",
        name: "Literature and Composition",
        department: "English",
        description: "A course focused on critical reading, analytical writing, and literary interpretation.",
        createdAt: new Date().toISOString(),
    },
];