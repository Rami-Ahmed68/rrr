const express = require("express")
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config/.env" });
const cors = require("cors");


// select the api methods and origin ( who can use the api's )
const corsOptions = {
  origin: "*",
  methods: "GET,PUT,POST,DELETE",
};

// to allow the use of the API
app.use(cors(corsOptions));

// import error validate
const ApiErrors = require("./src/utils/validation_error/ApiErrors");
const Global = require("./src/middleware/validation_errors.js/VaildateError");
// import error validate

// auto delete messages method
const AutoDeleteMessages = require("./src/controllers/autoDeleteMessages");
// auto delete messages method

// run the delete messages method every 30 m
setInterval(AutoDeleteMessages, 1000);
// run the delete messages method every 30 m

app.use(express.json());
app.use(express.static(path.join(__dirname, "./images")));

// require supper admin files
// admin
const superCreateAdmin = require("./src/router/Auth/SuppreAdmin/Admin/create");
const superUpdateAdmin = require("./src/router/Auth/SuppreAdmin/Admin/update");
const superDeleteAdmin = require("./src/router/Auth/SuppreAdmin/Admin/delete");
// admin

// super
const superAdminLogin = require("./src/router/Auth/SuppreAdmin/login");
const superAdminupdate = require("./src/router/Auth/SuppreAdmin/update");
// super

// teacher
const superCreateTeacher = require("./src/router/Auth/SuppreAdmin/Teacher/create");
const superDeleteTeacher = require("./src/router/Auth/SuppreAdmin/Teacher/delete");
const superUpdateTeacher = require("./src/router/Auth/SuppreAdmin/Teacher/update");
// teacher

// student
const superCreateStudent = require("./src/router/Auth/SuppreAdmin/Student/create");
const superDeleteStudent = require("./src/router/Auth/SuppreAdmin/Student/delete");
const superUpdateStudent = require("./src/router/Auth/SuppreAdmin/Student/update");
// student

// parent
const superCreateParent = require("./src/router/Auth/SuppreAdmin/Parent/create");
const superDeleteParent = require("./src/router/Auth/SuppreAdmin/Parent/delete");
const superUpdateParent = require("./src/router/Auth/SuppreAdmin/Parent/update");
// parent

// require supper admin files

// create supper admin api's
// admin api's
app.use("/api/v1/super/admin/create", superCreateAdmin);
app.use("/api/v1/super/admin/update", superUpdateAdmin);
app.use("/api/v1/super/admin/delete", superDeleteAdmin);
// admin api's

// super api's
app.use("/api/v1/super/login", superAdminLogin);
app.use("/api/v1/super/update", superAdminupdate);
// super api's

// teacher api's
app.use("/api/v1/super/teacher/create", superCreateTeacher);
app.use("/api/v1/super/teacher/delete", superDeleteTeacher);
app.use("/api/v1/super/teacher/update", superUpdateTeacher);
// teacher api's

// student api's
app.use("/api/v1/super/student/create", superCreateStudent);
app.use("/api/v1/super/student/delete", superDeleteStudent);
app.use("/api/v1/super/student/update", superUpdateStudent);
// student api's

// parent api's
app.use("/api/v1/super/parent/create", superCreateParent);
app.use("/api/v1/super/parent/delete", superDeleteParent);
app.use("/api/v1/super/parent/update", superUpdateParent);
// parent api's

// create supper admin api's

// require admin files
// admin
const updateAdmin = require("./src/router/Auth/Admin/update");
const loginAdmin = require("./src/router/Auth/Admin/login");
// admin

// parent
const adminCreateParent = require("./src/router/Auth/Admin/Parent/create");
const adminDeleteParent = require("./src/router/Auth/Admin/Parent/delete");
const adminUpdateParent = require("./src/router/Auth/Admin/Parent/update");
// parent

// student
const adminCreateStudent = require("./src/router/Auth/Admin/Student/create");
const adminDeleteStudent = require("./src/router/Auth/Admin/Student/delete");
const adminUpdateStudent = require("./src/router/Auth/Admin/Student/update");
// student

// teacher
const adminCreateTeacher = require("./src/router/Auth/Admin/Teacher/create");
const adminDeleteTeacher = require("./src/router/Auth/Admin/Teacher/delete");
const adminUpdateTeacher = require("./src/router/Auth/Admin/Teacher/update");
// teacher

// get
const adminGetOne = require("./src/router/Admin/get_one");
const adminGetAll = require("./src/router/Admin/get_all");
const get_admins_count = require("./src/router/Admin/get_admins_count");
// get
// require admin files

// create admin api's
// admin api's
app.use("/api/v1/admin/update", updateAdmin);
app.use("/api/v1/admin/login", loginAdmin);
// admin api's

// parent api's
app.use("/api/v1/admin/parent/create", adminCreateParent);
app.use("/api/v1/admin/parent/delete", adminDeleteParent);
app.use("/api/v1/admin/parent/update", adminUpdateParent);
// parent api's

// student api's
app.use("/api/v1/admin/student/create", adminCreateStudent);
app.use("/api/v1/admin/student/delete", adminDeleteStudent);
app.use("/api/v1/admin/student/update", adminUpdateStudent);
// student api's

// teacher api's
app.use("/api/v1/admin/teacher/create", adminCreateTeacher);
app.use("/api/v1/admin/teacher/delete", adminDeleteTeacher);
app.use("/api/v1/admin/teacher/update", adminUpdateTeacher);
// teacher api's

// get
app.use("/api/v1/admin/get/one", adminGetOne);
app.use("/api/v1/admin/get/all", adminGetAll);
app.use("/api/v1/admin/get/count" , get_admins_count);
// get
// create admin api's

// require teacher files
const TeacherLogin = require("./src/router/Auth/Teacher/login");
const TeacherUpdate = require("./src/router/Auth/Teacher/update");
const TeacherGetOne = require("./src/router/Teacher/get_one");
const TeacherGetAll = require("./src/router/Teacher/get_all");
const GetTeachersCount = require("./src/router/Teacher/get_Teachers_count");
const GetTeachersClasses = require("./src/router/Teacher/get_classes");
const GetTeachersPlans = require("./src/router/Teacher/get_plans");
// require teacher files

// create teacher api's
app.use("/api/v1/teacher/login", TeacherLogin);
app.use("/api/v1/teacher/update", TeacherUpdate);

// get teacher
app.use("/api/v1/teacher/get/one", TeacherGetOne);
app.use("/api/v1/teacher/get/all", TeacherGetAll);
app.use("/api/v1/teacher/get/count" , GetTeachersCount);
app.use("/api/v1/teacher/get/classes" , GetTeachersClasses);
app.use("/api/v1/teacher/get/plans" , GetTeachersPlans);
// get teacher
// create teacher api's

// require student files
const StudentLogin = require("./src/router/Auth/Student/login");
const StudentUpdate = require("./src/router/Auth/Student/update");
const StudentGetOne = require("./src/router/Student/get_one");
const StudentGetAll = require("./src/router/Student/get_all");
const StudentGetTop = require("./src/router/Student/get_the_top");
const GetStudentsCount = require("./src/router/Student/get_Students_count");
const GetStudentsClasses = require("./src/router/Student/get_classes");
const GetStudentsPlans = require("./src/router/Student/get_plans");
const UpdateStudentPoints = require("./src/router/Student/update_points");
// require student files


// create student api's
app.use("/api/v1/student/login", StudentLogin);
app.use("/api/v1/student/update", StudentUpdate);

// get students
app.use("/api/v1/student/get/one", StudentGetOne);
app.use("/api/v1/student/get/all", StudentGetAll);
app.use("/api/v1/student/get/top" , StudentGetTop);
app.use("/api/v1/student/get/count" , GetStudentsCount);
app.use("/api/v1/student/get/classes" , GetStudentsClasses);
app.use("/api/v1/student/get/plans" , GetStudentsPlans);
app.use("/api/v1/student/update/points" , UpdateStudentPoints);
// get students

// create student api's

// require parent files

const ParentLogin = require("./src/router/Auth/Parent/login");
const ParentUpdate = require("./src/router/Auth/Parent/update");
const ParentGetOne = require("./src/router/Parent/get_one");
const ParentGetAll = require("./src/router/Parent/get_all");
const GetParentsCount = require("./src/router/Parent/get_parents_count");

// require parent files

// create parent api's
app.use("/api/v1/parent/login", ParentLogin);
app.use("/api/v1/parent/update", ParentUpdate);

// get parent
app.use("/api/v1/parent/get/one", ParentGetOne);
app.use("/api/v1/parent/get/all", ParentGetAll);
app.use("/api/v1/parent/get/count" , GetParentsCount)
// get parent

// create parent api's

// require rate files
// super
const superStartRate = require("./src/router/Auth/SuppreAdmin/Teacher/start_rate");
// super

// admin
const adminStartRate = require("./src/router/Auth/Admin/Teacher/start_rate");
// admin

// student
const studentRate = require("./src/router/Rate/add_rate");
// student
// require rate files

// create rate api's
// super start rate
app.use("/api/v1/super/rate", superStartRate);
// super start rate

// admin start rate
app.use("/api/v1/admin/rate", adminStartRate);
// admin start rate

// student add rate
app.use("/api/v1/student/rate/add", studentRate);
// student add rate
// create rate api's

// require class files
// super admin
const superCreateClass = require("./src/router/Class/Suppre_Admin/create");
const superDeleteClass = require("./src/router/Class/Suppre_Admin/delete");
const superUpdateClass = require("./src/router/Class/Suppre_Admin/update");
// super admin

// admin
const adminCreateClass = require("./src/router/Class/Admin/create");
const adminDeleteClass = require("./src/router/Class/Admin/delete");
const adminUpdateClass = require("./src/router/Class/Admin/update");
// admin

// teacher
const teacherCreateClass = require("./src/router/Class/Teacher/create");
const teacherDeleteClass = require("./src/router/Class/Teacher/delete");
const teacherUpdateClass = require("./src/router/Class/Teacher/update");
// teacher

// get classes
const ClassGetOne = require("./src/router/Class/get_one");
const ClassGetAll = require("./src/router/Class/get_all");
// get classes

// get to classes count
const GetClassesCount = require("./src/router/Class/get_classes_count");
// get to classes count

// join & leave class
const JoiToClass = require("./src/router/Class/joi_class");
const LeaveToClass = require("./src/router/Class/leave_class");
// join & leave class
// require class files

// create class api's
// super admin
app.use("/api/v1/super/class/create", superCreateClass);
app.use("/api/v1/super/class/delete", superDeleteClass);
app.use("/api/v1/super/class/update", superUpdateClass);
// super admin

// admin
app.use("/api/v1/admin/class/create", adminCreateClass);
app.use("/api/v1/admin/class/delete", adminDeleteClass);
app.use("/api/v1/admin/class/update", adminUpdateClass);
// admin

// teacher
app.use("/api/v1/teacher/class/create", teacherCreateClass);
app.use("/api/v1/teacher/class/delete", teacherDeleteClass);
app.use("/api/v1/teacher/class/update", teacherUpdateClass);
// teacher

// get class
app.use("/api/v1/class/get/one", ClassGetOne);
app.use("/api/v1/class/get/all", ClassGetAll);
app.use("/api/v1/class/get/count" , GetClassesCount);
// get class

// join & leave class
app.use("/api/v1/class/join", JoiToClass);
app.use("/api/v1/class/leave", LeaveToClass);
// join & leave class
// create class api's

// require food files
// super admin
const superCreateFood = require("./src/router/Food/Supper_Admin/create");
const superDeleteFood = require("./src/router/Food/Supper_Admin/delete");
const superUpdateFood = require("./src/router/Food/Supper_Admin/update");
// super admin

// admin
const adminCreateFood = require("./src/router/Food/Admin/create");
const adminDeleteFood = require("./src/router/Food/Admin/delete");
const adminUpdateFood = require("./src/router/Food/Admin/update");
// admin

// get
const FoodGetOne = require("./src/router/Food/get_one");
const FoodGetAll = require("./src/router/Food/get_all");
const GetFoodsCount = require("./src/router/Food/get_food_count");
// get

// require food files

// create food api's

// super admin
app.use("/api/v1/super/food/create", superCreateFood);
app.use("/api/v1/super/food/delete", superDeleteFood);
app.use("/api/v1/super/food/update", superUpdateFood);
// super admin

// admin
app.use("/api/v1/admin/food/create", adminCreateFood);
app.use("/api/v1/admin/food/delete", adminDeleteFood);
app.use("/api/v1/admin/food/update", adminUpdateFood);
// admin

// get
app.use("/api/v1/food/get/one", FoodGetOne);
app.use("/api/v1/food/get/all", FoodGetAll);
app.use("/api/v1/food/get/count" , GetFoodsCount);
// get

// create food api's

// require plan files

// super admin
const superPlanCreate = require("./src/router/Plan/Supper_Admin/create");
const superPlanDelete = require("./src/router/Plan/Supper_Admin/delete");
const superPlanUpdate = require("./src/router/Plan/Supper_Admin/update");
// super admin

// admin
const adminPlanCreate = require("./src/router/Plan/Admin/create");
const adminPlanDelete = require("./src/router/Plan/Admin/delete");
const adminPlanUpdate = require("./src/router/Plan/Admin/update");
// admin

// teacher
const teacherPlanCopy = require("./src/router/Plan/Teacher/copy_plan");
// teacher

// student
const studentPlanCopy = require("./src/router/Plan/Student/copy_plan");
// student

// get
const planGetAll = require("./src/router/Plan/get_all");
const planGetOne = require("./src/router/Plan/get_one");
const GetPlansCount = require("./src/router/Plan/get_plans_count");
// get

// require plan files

// create plan api's
// super admin
app.use("/api/v1/super/plan/create", superPlanCreate);
app.use("/api/v1/super/plan/delete", superPlanDelete);
app.use("/api/v1/super/plan/update", superPlanUpdate);
// super admin

// admin
app.use("/api/v1/admin/plan/create", adminPlanCreate);
app.use("/api/v1/admin/plan/delete", adminPlanDelete);
app.use("/api/v1/admin/plan/update", adminPlanUpdate);
// admin

// teacher copy plan
app.use("/api/v1/teacher/plan/copy", teacherPlanCopy);
// teacher copy plan

// student copy plan
app.use("/api/v1/student/plan/copy", studentPlanCopy);
// student copy plan

// get
app.use("/api/v1/plan/get/all", planGetAll);
app.use("/api/v1/plan/get/one", planGetOne);
app.use("/api/v1/plan/get/count" , GetPlansCount);
// get
// create plan api's

// require message files
// super admin
const superMessageCreate = require("./src/router/Message/Supper_Admin/create");
const superMessageDelete = require("./src/router/Message/Supper_Admin/delete");
const superMessageUpdate = require("./src/router/Message/Supper_Admin/update");
// super admin

// admin
const adminMessageCreate = require("./src/router/Message/Admin/create");
const adminMessageDelete = require("./src/router/Message/Admin/delete");
const adminMessageUpdate = require("./src/router/Message/Admin/update");
// admin

// get
const messageGetAll = require("./src/router/Message/get_all");
const messageGetOne = require("./src/router/Message/get_one");
const getMessgaesCount = require("./src/router/Message/get_messages_count");
// get
// require message files

// craete reate message api's
// super
app.use("/api/v1/super/message/create", superMessageCreate);
app.use("/api/v1/super/message/delete", superMessageDelete);
app.use("/api/v1/super/message/update", superMessageUpdate);
// super

// admin
app.use("/api/v1/admin/message/create", adminMessageCreate);
app.use("/api/v1/admin/message/delete", adminMessageDelete);
app.use("/api/v1/admin/message/update", adminMessageUpdate);
// admin

// get
app.use("/api/v1/message/get/all", messageGetAll);
app.use("/api/v1/message/get/one", messageGetOne);
app.use("/api/v1/message/get/count" , getMessgaesCount);
// get
// craete reate message api's

// require home work files

// super admin
const superHwCreate = require("./src/router/HomeWork/Supper_Admin/create");
const superHwDelete = require("./src/router/HomeWork/Supper_Admin/delete");
const superHwUpdate = require("./src/router/HomeWork/Supper_Admin/update");
// super admin

// admin
const adminHwCreate = require("./src/router/HomeWork/Admin/create");
const adminHwDelete = require("./src/router/HomeWork/Admin/delete");
const adminHwUpdate = require("./src/router/HomeWork/Admin/update");
// admin

// teacher
const teacherHwCreate = require("./src/router/HomeWork/Teacher/create");
const teacherHwDelete = require("./src/router/HomeWork/Teacher/delete");
const teacherHwUpdate = require("./src/router/HomeWork/Teacher/update");
// teacher

// get
const hwGetOne = require("./src/router/HomeWork/get_one");
const hwGetAll = require("./src/router/HomeWork/get_all");
const hwCount = require("./src/router/HomeWork/get_home_works_count");
// get

// require home work files

// create home work api's

// super admin
app.use("/api/v1/super/hw/create", superHwCreate);
app.use("/api/v1/super/hw/delete", superHwDelete);
app.use("/api/v1/super/hw/update", superHwUpdate);
// super admin

// admin
app.use("/api/v1/admin/hw/create", adminHwCreate);
app.use("/api/v1/admin/hw/delete", adminHwDelete);
app.use("/api/v1/admin/hw/update", adminHwUpdate);
// admin

// teacher
app.use("/api/v1/teacher/hw/create", teacherHwCreate);
app.use("/api/v1/teacher/hw/delete", teacherHwDelete);
app.use("/api/v1/teacher/hw/update", teacherHwUpdate);
// teacher

// get
app.use("/api/v1/hw/get/one", hwGetOne);
app.use("/api/v1/hw/get/all", hwGetAll);
app.use("/api/v1/hw/get/count" , hwCount);
// get

// create home work api's

// require alwatania files

// super admin
const superAlwataniaCreate = require("./src/router/Subjects/alwatania/Supper_Admin/create");
const superAlwataniaDelete = require("./src/router/Subjects/alwatania/Supper_Admin/delete");
const superAlwataniaUpdate = require("./src/router/Subjects/alwatania/Supper_Admin/update");
// super admin

// admin
const adminAlwataniaCreate = require("./src/router/Subjects/alwatania/Admin/create");
const adminAlwataniaDelete = require("./src/router/Subjects/alwatania/Admin/delete");
const adminAlwataniaUpdate = require("./src/router/Subjects/alwatania/Admin/update");
// admin

// teacher
const teacherAlwataniaCreate = require("./src/router/Subjects/alwatania/Teacher/create");
const teacherAlwataniaDelete = require("./src/router/Subjects/alwatania/Teacher/delete");
const teacherAlwataniaUpdate = require("./src/router/Subjects/alwatania/Teacher/update");
// teacher

// get
const AlwataniaGetOne = require("./src/router/Subjects/alwatania/get_one");
const AlwataniaGetAll = require("./src/router/Subjects/alwatania/get_all");
const GetAlwataniaQuestionsCount = require("./src/router/Subjects/alwatania/get_questions_count");
// get

// start exam
const alwataniaExam = require("./src/router/Subjects/alwatania/start_exam");
// start exam

// require alwatania files

// create alawatnai api's

// super admin
app.use("/api/v1/super/alwatania/create", superAlwataniaCreate);
app.use("/api/v1/super/alwatania/delete", superAlwataniaDelete);
app.use("/api/v1/super/alwatania/update", superAlwataniaUpdate);
// super admin

// super admin
app.use("/api/v1/admin/alwatania/create", adminAlwataniaCreate);
app.use("/api/v1/admin/alwatania/delete", adminAlwataniaDelete);
app.use("/api/v1/admin/alwatania/update", adminAlwataniaUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/alwatania/create", teacherAlwataniaCreate);
app.use("/api/v1/teacher/alwatania/delete", teacherAlwataniaDelete);
app.use("/api/v1/teacher/alwatania/update", teacherAlwataniaUpdate);
// super admin

// get
app.use("/api/v1/alwatania/get/one", AlwataniaGetOne);
app.use("/api/v1/alwatania/get/all", AlwataniaGetAll);
app.use("/api/v1/alwatania/get/count" , GetAlwataniaQuestionsCount);
// get

// start exam
app.use("/api/v1/alwatania/exam", alwataniaExam);
// start exam

// create alawatnai api's

// require math files
// super admin
const superMathCreate = require("./src/router/Subjects/Math/Supper_Admin/create");
const superMathDelete = require("./src/router/Subjects/Math/Supper_Admin/delete");
const superMathUpdate = require("./src/router/Subjects/Math/Supper_Admin/update");
// super admin

// admin
const adminMathCreate = require("./src/router/Subjects/Math/Admin/create");
const adminMathDelete = require("./src/router/Subjects/Math/Admin/delete");
const adminMathUpdate = require("./src/router/Subjects/Math/Admin/update");
// admin

// teacher
const teacherMathCreate = require("./src/router/Subjects/Math/Teacher/create");
const teacherMathDelete = require("./src/router/Subjects/Math/Teacher/delete");
const teacherMathUpdate = require("./src/router/Subjects/Math/Teacher/update");
// teacher

// get
const MathGetOne = require("./src/router/Subjects/Math/get_one");
const MathGetAll = require("./src/router/Subjects/Math/get_all");
const GetMathQuestionsCount = require("./src/router/Subjects/Math/get_questions_count");
// get

// start exam
const mathExam = require("./src/router/Subjects/Math/start_exam");
// start exam
// require math files

// create math api's
// super admin
app.use("/api/v1/super/math/create", superMathCreate);
app.use("/api/v1/super/math/delete", superMathDelete);
app.use("/api/v1/super/math/update", superMathUpdate);
// super admin

// super admin
app.use("/api/v1/admin/math/create", adminMathCreate);
app.use("/api/v1/admin/math/delete", adminMathDelete);
app.use("/api/v1/admin/math/update", adminMathUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/math/create", teacherMathCreate);
app.use("/api/v1/teacher/math/delete", teacherMathDelete);
app.use("/api/v1/teacher/math/update", teacherMathUpdate);
// super admin

// get
app.use("/api/v1/math/get/one", MathGetOne);
app.use("/api/v1/math/get/all", MathGetAll);
app.use("/api/v1/math/get/count" , GetMathQuestionsCount);
// get

// start exam
app.use("/api/v1/math/exam", mathExam);
// start exam
// create math api's

// require Islam files
// super admin
const superReligionCreate = require("./src/router/Subjects/Religion/Supper_Admin/create");
const superReligionDelete = require("./src/router/Subjects/Religion/Supper_Admin/delete");
const superReligionUpdate = require("./src/router/Subjects/Religion/Supper_Admin/update");
// super admin

// admin
const adminReligionCreate = require("./src/router/Subjects/Religion/Admin/create");
const adminReligionDelete = require("./src/router/Subjects/Religion/Admin/delete");
const adminReligionUpdate = require("./src/router/Subjects/Religion/Admin/update");
// admin

// teacher
const teacherReligionCreate = require("./src/router/Subjects/Religion/Teacher/create");
const teacherReligionDelete = require("./src/router/Subjects/Religion/Teacher/delete");
const teacherReligionUpdate = require("./src/router/Subjects/Religion/Teacher/update");
// teacher

// get
const ReligionGetOne = require("./src/router/Subjects/Religion/get_one");
const ReligionGetAll = require("./src/router/Subjects/Religion/get_all");
const GetReligionQuestionsCount = require("./src/router/Subjects/Religion/get_questions_count");
// get

// start exam
const religionExam = require("./src/router/Subjects/Religion/start_exam");
// start exam
// require Islam files

// create islam api's
// super admin
app.use("/api/v1/super/islam/create", superReligionCreate);
app.use("/api/v1/super/islam/delete", superReligionDelete);
app.use("/api/v1/super/islam/update", superReligionUpdate);
// super admin

// super admin
app.use("/api/v1/admin/islam/create", adminReligionCreate);
app.use("/api/v1/admin/islam/delete", adminReligionDelete);
app.use("/api/v1/admin/islam/update", adminReligionUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/islam/create", teacherReligionCreate);
app.use("/api/v1/teacher/islam/delete", teacherReligionDelete);
app.use("/api/v1/teacher/islam/update", teacherReligionUpdate);
// super admin

// get
app.use("/api/v1/islam/get/one", ReligionGetOne);
app.use("/api/v1/islam/get/all", ReligionGetAll);
app.use("/api/v1/islam/get/count" , GetReligionQuestionsCount);
// get

// start exam
app.use("/api/v1/islam/exam", religionExam);
// start exam
// create islam api's

// require english files
// super admin
const superEnglishCreate = require("./src/router/Subjects/English/Supper_Admin/create");
const superEnglishDelete = require("./src/router/Subjects/English/Supper_Admin/delete");
const superEnglishUpdate = require("./src/router/Subjects/English/Supper_Admin/update");
// super admin

// admin
const adminEnglishCreate = require("./src/router/Subjects/English/Admin/create");
const adminEnglishDelete = require("./src/router/Subjects/English/Admin/delete");
const adminEnglishUpdate = require("./src/router/Subjects/English/Admin/update");
// admin

// teacher
const teacherEnglishCreate = require("./src/router/Subjects/English/Teacher/create");
const teacherEnglishDelete = require("./src/router/Subjects/English/Teacher/delete");
const teacherEnglishUpdate = require("./src/router/Subjects/English/Teacher/update");
// teacher

// get
const EnglishGetOne = require("./src/router/Subjects/English/get_one");
const EnglishGetAll = require("./src/router/Subjects/English/get_all");
const GetEnglishQuestionsCount = require("./src/router/Subjects/English/get_questions_count");
// get

// start exam
const englishExam = require("./src/router/Subjects/English/start_exam");
// start exam
// require english files

// create english api's
// super admin
app.use("/api/v1/super/english/create", superEnglishCreate);
app.use("/api/v1/super/english/delete", superEnglishDelete);
app.use("/api/v1/super/english/update", superEnglishUpdate);
// super admin

// super admin
app.use("/api/v1/admin/english/create", adminEnglishCreate);
app.use("/api/v1/admin/english/delete", adminEnglishDelete);
app.use("/api/v1/admin/english/update", adminEnglishUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/english/create", teacherEnglishCreate);
app.use("/api/v1/teacher/english/delete", teacherEnglishDelete);
app.use("/api/v1/teacher/english/update", teacherEnglishUpdate);
// super admin

// get
app.use("/api/v1/english/get/one", EnglishGetOne);
app.use("/api/v1/english/get/all", EnglishGetAll);
app.use("/api/v1/english/get/count" , GetEnglishQuestionsCount);
// get

// start exam
app.use("/api/v1/english/exam", englishExam);
// start exam
// create english api's

// require french files
// super admin
const superFrenchCreate = require("./src/router/Subjects/French/Supper_Admin/create");
const superFrenchDelete = require("./src/router/Subjects/French/Supper_Admin/delete");
const superFrenchUpdate = require("./src/router/Subjects/French/Supper_Admin/update");
// super admin

// admin
const adminFrenchCreate = require("./src/router/Subjects/French/Admin/create");
const adminFrenchDelete = require("./src/router/Subjects/French/Admin/delete");
const adminFrenchUpdate = require("./src/router/Subjects/French/Admin/update");
// admin

// teacher
const teacherFrenchCreate = require("./src/router/Subjects/French/Teacher/create");
const teacherFrenchDelete = require("./src/router/Subjects/French/Teacher/delete");
const teacherFrenchUpdate = require("./src/router/Subjects/French/Teacher/update");
// teacher

// get
const FrenchGetOne = require("./src/router/Subjects/French/get_one");
const FrenchGetAll = require("./src/router/Subjects/French/get_all");
const GetFrenchQuestionsCount = require("./src/router/Subjects/French/get_questions_count");
// get

// start exam
const frenchExam = require("./src/router/Subjects/French/start_exam");
// start exam
// require french files

// create french api's
// super admin
app.use("/api/v1/super/french/create", superFrenchCreate);
app.use("/api/v1/super/french/delete", superFrenchDelete);
app.use("/api/v1/super/french/update", superFrenchUpdate);
// super admin

// super admin
app.use("/api/v1/admin/french/create", adminFrenchCreate);
app.use("/api/v1/admin/french/delete", adminFrenchDelete);
app.use("/api/v1/admin/french/update", adminFrenchUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/french/create", teacherFrenchCreate);
app.use("/api/v1/teacher/french/delete", teacherFrenchDelete);
app.use("/api/v1/teacher/french/update", teacherFrenchUpdate);
// super admin

// get
app.use("/api/v1/french/get/one", FrenchGetOne);
app.use("/api/v1/french/get/all", FrenchGetAll);
app.use("/api/v1/french/get/count" , GetFrenchQuestionsCount);
// get

// start exam
app.use("/api/v1/french/exam", frenchExam);
// start exam
// create french api's

// require arabic files
// super admin
const superArabicCreate = require("./src/router/Subjects/Arabic/Supper_Admin/create");
const superArabicDelete = require("./src/router/Subjects/Arabic/Supper_Admin/delete");
const superArabicUpdate = require("./src/router/Subjects/Arabic/Supper_Admin/update");
// super admin

// admin
const adminArabicCreate = require("./src/router/Subjects/Arabic/Admin/create");
const adminArabicDelete = require("./src/router/Subjects/Arabic/Admin/delete");
const adminArabicUpdate = require("./src/router/Subjects/Arabic/Admin/update");
// admin

// teacher
const teacherArabicCreate = require("./src/router/Subjects/Arabic/Teacher/create");
const teacherArabicDelete = require("./src/router/Subjects/Arabic/Teacher/delete");
const teacherArabicUpdate = require("./src/router/Subjects/Arabic/Teacher/update");
// teacher

// get
const ArabicGetOne = require("./src/router/Subjects/Arabic/get_one");
const ArabicGetAll = require("./src/router/Subjects/Arabic/get_all");
const GetArabicQuestionsCount = require("./src/router/Subjects/Arabic/get_questions_count");
// get

// start exam
const arabicExam = require("./src/router/Subjects/Arabic/start_exam");
// start exam
// require arabic files

// create arabic api's
// super admin
app.use("/api/v1/super/arabic/create", superArabicCreate);
app.use("/api/v1/super/arabic/delete", superArabicDelete);
app.use("/api/v1/super/arabic/update", superArabicUpdate);
// super admin

// super admin
app.use("/api/v1/admin/arabic/create", adminArabicCreate);
app.use("/api/v1/admin/arabic/delete", adminArabicDelete);
app.use("/api/v1/admin/arabic/update", adminArabicUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/arabic/create", teacherArabicCreate);
app.use("/api/v1/teacher/arabic/delete", teacherArabicDelete);
app.use("/api/v1/teacher/arabic/update", teacherArabicUpdate);
// super admin

// get
app.use("/api/v1/arabic/get/one", ArabicGetOne);
app.use("/api/v1/arabic/get/all", ArabicGetAll);
app.use("/api/v1/arabic/get/count" , GetArabicQuestionsCount);
// get

// start exam
app.use("/api/v1/arabic/exam", arabicExam);
// start exam
// create arabic api's

// require history files
// super admin
const superHistoryCreate = require("./src/router/Subjects/History/Supper_Admin/create");
const superHistoryDelete = require("./src/router/Subjects/History/Supper_Admin/delete");
const superHistoryUpdate = require("./src/router/Subjects/History/Supper_Admin/update");
// super admin

// admin
const adminHistoryCreate = require("./src/router/Subjects/History/Admin/create");
const adminHistoryDelete = require("./src/router/Subjects/History/Admin/delete");
const adminHistoryUpdate = require("./src/router/Subjects/History/Admin/update");
// admin

// teacher
const teacherHistoryCreate = require("./src/router/Subjects/History/Teacher/create");
const teacherHistoryDelete = require("./src/router/Subjects/History/Teacher/delete");
const teacherHistoryUpdate = require("./src/router/Subjects/History/Teacher/update");
// teacher

// get
const HistoryGetOne = require("./src/router/Subjects/History/get_one");
const HistoryGetAll = require("./src/router/Subjects/History/get_all");
const GetHistoryQuestionsCount = require("./src/router/Subjects/History/get_questions_count");
// get

// start exam
const historyExam = require("./src/router/Subjects/History/start_exam");
// start exam
// require arabic files

// create history api's
// super admin
app.use("/api/v1/super/history/create", superHistoryCreate);
app.use("/api/v1/super/history/delete", superHistoryDelete);
app.use("/api/v1/super/history/update", superHistoryUpdate);
// super admin

// super admin
app.use("/api/v1/admin/history/create", adminHistoryCreate);
app.use("/api/v1/admin/history/delete", adminHistoryDelete);
app.use("/api/v1/admin/history/update", adminHistoryUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/history/create", teacherHistoryCreate);
app.use("/api/v1/teacher/history/delete", teacherHistoryDelete);
app.use("/api/v1/teacher/history/update", teacherHistoryUpdate);
// super admin

// get
app.use("/api/v1/history/get/one", HistoryGetOne);
app.use("/api/v1/history/get/all", HistoryGetAll);
app.use("/api/v1/history/get/count" , GetHistoryQuestionsCount);
// get

// start exam
app.use("/api/v1/history/exam", historyExam);
// start exam
// create history api's

// require chemistry files
// super admin
const superChemistryCreate = require("./src/router/Subjects/chemistry/Supper_Admin/create");
const superChemistryDelete = require("./src/router/Subjects/chemistry/Supper_Admin/delete");
const superChemistryUpdate = require("./src/router/Subjects/chemistry/Supper_Admin/update");
// super admin

// admin
const adminChemistryCreate = require("./src/router/Subjects/chemistry/Admin/create");
const adminChemistryDelete = require("./src/router/Subjects/chemistry/Admin/delete");
const adminChemistryUpdate = require("./src/router/Subjects/chemistry/Admin/update");
// admin

// teacher
const teacherChemistryCreate = require("./src/router/Subjects/chemistry/Teacher/create");
const teacherChemistryDelete = require("./src/router/Subjects/chemistry/Teacher/delete");
const teacherChemistryUpdate = require("./src/router/Subjects/chemistry/Teacher/update");
// teacher

// get
const ChemistryGetOne = require("./src/router/Subjects/chemistry/get_one");
const ChemistryGetAll = require("./src/router/Subjects/chemistry/get_all");
const GetChemistryQuestionsCount = require("./src/router/Subjects/chemistry/get_questions_count");
// get

// start exam
const chemistryExam = require("./src/router/Subjects/chemistry/start_exam");
// start exam
// require chemistry files

// create chemistry api's
// super admin
app.use("/api/v1/super/chemistry/create", superChemistryCreate);
app.use("/api/v1/super/chemistry/delete", superChemistryDelete);
app.use("/api/v1/super/chemistry/update", superChemistryUpdate);
// super admin

// super admin
app.use("/api/v1/admin/chemistry/create", adminChemistryCreate);
app.use("/api/v1/admin/chemistry/delete", adminChemistryDelete);
app.use("/api/v1/admin/chemistry/update", adminChemistryUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/chemistry/create", teacherChemistryCreate);
app.use("/api/v1/teacher/chemistry/delete", teacherChemistryDelete);
app.use("/api/v1/teacher/chemistry/update", teacherChemistryUpdate);
// super admin

// get
app.use("/api/v1/chemistry/get/one", ChemistryGetOne);
app.use("/api/v1/chemistry/get/all", ChemistryGetAll);
app.use("/api/v1/chemistry/get/count" , GetChemistryQuestionsCount);
// get

// start exam
app.use("/api/v1/chemistry/exam", chemistryExam);
// start exam
// create chemistry api's

// require physics files
// super admin
const superPhysicsCreate = require("./src/router/Subjects/Physics/Supper_Admin/create");
const superPhysicsDelete = require("./src/router/Subjects/Physics/Supper_Admin/delete");
const superPhysicsUpdate = require("./src/router/Subjects/Physics/Supper_Admin/update");
// super admin

// admin
const adminPhysicsCreate = require("./src/router/Subjects/Physics/Admin/create");
const adminPhysicsDelete = require("./src/router/Subjects/Physics/Admin/delete");
const adminPhysicsUpdate = require("./src/router/Subjects/Physics/Admin/update");
// admin

// teacher
const teacherPhysicsCreate = require("./src/router/Subjects/Physics/Teacher/create");
const teacherPhysicsDelete = require("./src/router/Subjects/Physics/Teacher/delete");
const teacherPhysicsUpdate = require("./src/router/Subjects/Physics/Teacher/update");
// teacher

// get
const PhysicsGetOne = require("./src/router/Subjects/Physics/get_one");
const PhysicsGetAll = require("./src/router/Subjects/Physics/get_all");
const GetPhysicsQuestionsCount = require("./src/router/Subjects/Physics/get_questions_count");
// get

// start exam
const physicsExam = require("./src/router/Subjects/Physics/start_exam");
// start exam
// require arabic files

// create Physics api's
// super admin
app.use("/api/v1/super/physics/create", superPhysicsCreate);
app.use("/api/v1/super/physics/delete", superPhysicsDelete);
app.use("/api/v1/super/physics/update", superPhysicsUpdate);
// super admin

// super admin
app.use("/api/v1/admin/physics/create", adminPhysicsCreate);
app.use("/api/v1/admin/physics/delete", adminPhysicsDelete);
app.use("/api/v1/admin/physics/update", adminPhysicsUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/physics/create", teacherPhysicsCreate);
app.use("/api/v1/teacher/physics/delete", teacherPhysicsDelete);
app.use("/api/v1/teacher/physics/update", teacherPhysicsUpdate);
// super admin

// get
app.use("/api/v1/physics/get/one", PhysicsGetOne);
app.use("/api/v1/physics/get/all", PhysicsGetAll);
app.use("/api/v1/physics/get/count" , GetPhysicsQuestionsCount);
// get

// start exam
app.use("/api/v1/physics/exam", physicsExam);
// start exam
// create Physics api's

// require sciences files
// super admin
const superSciencesCreate = require("./src/router/Subjects/Sciences/Supper_Admin/create");
const superSciencesDelete = require("./src/router/Subjects/Sciences/Supper_Admin/delete");
const superSciencesUpdate = require("./src/router/Subjects/Sciences/Supper_Admin/update");
// super admin

// admin
const adminSciencesCreate = require("./src/router/Subjects/Sciences/Admin/create");
const adminSciencesDelete = require("./src/router/Subjects/Sciences/Admin/delete");
const adminSciencesUpdate = require("./src/router/Subjects/Sciences/Admin/update");
// admin

// teacher
const teacherSciencesCreate = require("./src/router/Subjects/Sciences/Teacher/create");
const teacherSciencesDelete = require("./src/router/Subjects/Sciences/Teacher/delete");
const teacherSciencesUpdate = require("./src/router/Subjects/Sciences/Teacher/update");
// teacher

// get
const SciencesGetOne = require("./src/router/Subjects/Sciences/get_one");
const SciencesGetAll = require("./src/router/Subjects/Sciences/get_all");
const GetSciencesQuestionsCount = require("./src/router/Subjects/Sciences/get_questions_count");
// get

// start exam
const sciencesExam = require("./src/router/Subjects/Sciences/start_exam");
// start exam
// require arabic files

// create Sciences api's
// super admin
app.use("/api/v1/super/sciences/create", superSciencesCreate);
app.use("/api/v1/super/sciences/delete", superSciencesDelete);
app.use("/api/v1/super/sciences/update", superSciencesUpdate);
// super admin

// super admin
app.use("/api/v1/admin/sciences/create", adminSciencesCreate);
app.use("/api/v1/admin/sciences/delete", adminSciencesDelete);
app.use("/api/v1/admin/sciences/update", adminSciencesUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/sciences/create", teacherSciencesCreate);
app.use("/api/v1/teacher/sciences/delete", teacherSciencesDelete);
app.use("/api/v1/teacher/sciences/update", teacherSciencesUpdate);
// super admin

// get
app.use("/api/v1/sciences/get/one", SciencesGetOne);
app.use("/api/v1/sciences/get/all", SciencesGetAll);
app.use("/api/v1/sciences/get/count" , GetSciencesQuestionsCount);
// get


// start exam
app.use("/api/v1/sciences/exam", sciencesExam);
// start exam
// create sciences api's

// require geography files
// super admin
const superGeographyCreate = require("./src/router/Subjects/Geography/Supper_Admin/create");
const superGeographyDelete = require("./src/router/Subjects/Geography/Supper_Admin/delete");
const superGeographyUpdate = require("./src/router/Subjects/Geography/Supper_Admin/update");
// super admin

// admin
const adminGeographyCreate = require("./src/router/Subjects/Geography/Admin/create");
const adminGeographyDelete = require("./src/router/Subjects/Geography/Admin/delete");
const adminGeographyUpdate = require("./src/router/Subjects/Geography/Admin/update");
// admin

// teacher
const teacherGeographyCreate = require("./src/router/Subjects/Geography/Teacher/create");
const teacherGeographyDelete = require("./src/router/Subjects/Geography/Teacher/delete");
const teacherGeographyUpdate = require("./src/router/Subjects/Geography/Teacher/update");
// teacher

// get
const GeographyGetOne = require("./src/router/Subjects/Geography/get_one");
const GeographyGetAll = require("./src/router/Subjects/Geography/get_all");
const GetGeographyQuestionsCount = require("./src/router/Subjects/Geography/get_questions_count");
// get

// start exam
const geographyExam = require("./src/router/Subjects/Geography/start_exam");
// start exam
// require arabic files

// create Geography api's
// super admin
app.use("/api/v1/super/Geography/create", superGeographyCreate);
app.use("/api/v1/super/Geography/delete", superGeographyDelete);
app.use("/api/v1/super/Geography/update", superGeographyUpdate);
// super admin

// super admin
app.use("/api/v1/admin/Geography/create", adminGeographyCreate);
app.use("/api/v1/admin/Geography/delete", adminGeographyDelete);
app.use("/api/v1/admin/Geography/update", adminGeographyUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/Geography/create", teacherGeographyCreate);
app.use("/api/v1/teacher/Geography/delete", teacherGeographyDelete);
app.use("/api/v1/teacher/Geography/update", teacherGeographyUpdate);
// super admin

// get
app.use("/api/v1/Geography/get/one", GeographyGetOne);
app.use("/api/v1/Geography/get/all", GeographyGetAll);
app.use("/api/v1/Geography/get/count" , GetGeographyQuestionsCount);
// get

// start exam
app.use("/api/v1/Geography/exam", geographyExam);
// start exam
// create geography api's

// require philosophy files
// super admin
const superPhilosophyCreate = require("./src/router/Subjects/Philosophy/Supper_Admin/create");
const superPhilosophyDelete = require("./src/router/Subjects/Philosophy/Supper_Admin/delete");
const superPhilosophyUpdate = require("./src/router/Subjects/Philosophy/Supper_Admin/update");
// super admin

// admin
const adminPhilosophyCreate = require("./src/router/Subjects/Philosophy/Admin/create");
const adminPhilosophyDelete = require("./src/router/Subjects/Philosophy/Admin/delete");
const adminPhilosophyUpdate = require("./src/router/Subjects/Philosophy/Admin/update");
// admin

// teacher
const teacherPhilosophyCreate = require("./src/router/Subjects/Philosophy/Teacher/create");
const teacherPhilosophyDelete = require("./src/router/Subjects/Philosophy/Teacher/delete");
const teacherPhilosophyUpdate = require("./src/router/Subjects/Philosophy/Teacher/update");
// teacher

// get
const PhilosophyGetOne = require("./src/router/Subjects/Philosophy/get_one");
const PhilosophyGetAll = require("./src/router/Subjects/Philosophy/get_all");
const GetPhilosophyQuestionsCount = require("./src/router/Subjects/Philosophy/get_questions_count");
// get

// start exam
const philosophyExam = require("./src/router/Subjects/Philosophy/start_exam");
// start exam
// require arabic files

// create Philosophy api's
// super admin
app.use("/api/v1/super/philosophy/create", superPhilosophyCreate);
app.use("/api/v1/super/philosophy/delete", superPhilosophyDelete);
app.use("/api/v1/super/philosophy/update", superPhilosophyUpdate);
// super admin

// super admin
app.use("/api/v1/admin/philosophy/create", adminPhilosophyCreate);
app.use("/api/v1/admin/philosophy/delete", adminPhilosophyDelete);
app.use("/api/v1/admin/philosophy/update", adminPhilosophyUpdate);
// super admin

// super admin
app.use("/api/v1/teacher/philosophy/create", teacherPhilosophyCreate);
app.use("/api/v1/teacher/philosophy/delete", teacherPhilosophyDelete);
app.use("/api/v1/teacher/philosophy/update", teacherPhilosophyUpdate);
// super admin

// get
app.use("/api/v1/philosophy/get/one", PhilosophyGetOne);
app.use("/api/v1/philosophy/get/all", PhilosophyGetAll);
app.use("/api/v1/philosophy/get/count" , GetPhilosophyQuestionsCount);
// get

// start exam
app.use("/api/v1/philosophy/exam", philosophyExam);
// start exam
// create philosophy api's

app.use(express.urlencoded({ extended: true }));

// validate errors
app.all("*", (req, res, next) => {
  return next(
    new ApiErrors(
      JSON.stringify({
        english: "Invalid Api Not Found ...",
        arabic: "... (Api) عذرا لم يتم العثور على الرابط",
      }),
      404
    )
  );
});
// validate errors

// Global error handling middlware
app.use(Global);
// Global error handling middlware
//s
// connect to data base
mongoose
  .connect(process.env.DATA_BASE_LINK)
  .then(() => {
    console.log("###### Conected ######");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Serve Listen on port ${process.env.PORT}`);
});
