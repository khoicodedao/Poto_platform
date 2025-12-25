import 'dotenv/config';
import { db } from './index';
import { users, classes, classEnrollments, assignments, files, messages } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create admin account
  const [admin] = await db.insert(users).values([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Quản Trị Viên',
      role: 'admin',
      avatar: '/placeholder-user.jpg',
    },
  ]).returning();

  const [teacher1] = await db.insert(users).values([
    {
      email: 'teacher1@example.com',
      password: hashedPassword,
      name: 'Giáo viên Nguyễn Văn A',
      role: 'teacher',
      avatar: '/placeholder-user.jpg',
    },
  ]).returning();

  const [teacher2] = await db.insert(users).values([
    {
      email: 'teacher2@example.com',
      password: hashedPassword,
      name: 'Giáo viên Trần Thị B',
      role: 'teacher',
      avatar: '/placeholder-user.jpg',
    },
  ]).returning();

  const students = await db.insert(users).values([
    {
      email: 'student1@example.com',
      password: hashedPassword,
      name: 'Học viên Lê Văn C',
      role: 'student',
      avatar: '/placeholder-user.jpg',
    },
    {
      email: 'student2@example.com',
      password: hashedPassword,
      name: 'Học viên Phạm Thị D',
      role: 'student',
      avatar: '/placeholder-user.jpg',
    },
    {
      email: 'student3@example.com',
      password: hashedPassword,
      name: 'Học viên Hoàng Văn E',
      role: 'student',
      avatar: '/placeholder-user.jpg',
    },
  ]).returning();

  const [class1] = await db.insert(classes).values([
    {
      name: 'Lập trình Web cơ bản',
      description: 'Học HTML, CSS, JavaScript và React',
      teacherId: teacher1.id,
      schedule: 'Thứ 2, 4, 6 - 19:00-21:00',
      roomId: 'web-basic-101',
    },
  ]).returning();

  const [class2] = await db.insert(classes).values([
    {
      name: 'Python cho người mới bắt đầu',
      description: 'Học lập trình Python từ cơ bản đến nâng cao',
      teacherId: teacher2.id,
      schedule: 'Thứ 3, 5, 7 - 18:00-20:00',
      roomId: 'python-beginner-101',
    },
  ]).returning();

  await db.insert(classEnrollments).values([
    { classId: class1.id, studentId: students[0].id },
    { classId: class1.id, studentId: students[1].id },
    { classId: class2.id, studentId: students[1].id },
    { classId: class2.id, studentId: students[2].id },
  ]);

  const [assignment1] = await db.insert(assignments).values([
    {
      title: 'Bài tập HTML/CSS cơ bản',
      description: 'Tạo một trang web giới thiệu bản thân sử dụng HTML và CSS',
      classId: class1.id,
      createdById: teacher1.id,
      dueDate: new Date('2025-11-30'),
      maxScore: 100,
    },
  ]).returning();

  await db.insert(assignments).values([
    {
      title: 'Bài tập Python - Vòng lặp',
      description: 'Viết chương trình in ra bảng cửu chương',
      classId: class2.id,
      createdById: teacher2.id,
      dueDate: new Date('2025-11-25'),
      maxScore: 100,
    },
  ]);

  await db.insert(messages).values([
    {
      classId: class1.id,
      senderId: teacher1.id,
      content: 'Chào mừng các em đến với lớp Lập trình Web!',
    },
    {
      classId: class1.id,
      senderId: students[0].id,
      content: 'Xin chào thầy và các bạn!',
    },
    {
      classId: class2.id,
      senderId: teacher2.id,
      content: 'Chào các em! Chúng ta sẽ bắt đầu học Python nhé.',
    },
  ]);

  console.log('Database seeded successfully!');
  console.log('\nDemo accounts:');
  console.log('Admin:     admin@example.com / 123456');
  console.log('Teacher 1: teacher1@example.com / 123456');
  console.log('Teacher 2: teacher2@example.com / 123456');
  console.log('Student 1: student1@example.com / 123456');
  console.log('Student 2: student2@example.com / 123456');
  console.log('Student 3: student3@example.com / 123456');

  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
