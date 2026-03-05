-- IT Tech Arena AI - Reset and Insert Correct Students
-- This deletes OLD data and inserts CORRECT data from PDF

-- Disable RLS temporarily
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- DELETE all existing student data (keeps table structure)
DELETE FROM public.students;

-- Insert Admin Accounts (KARTHIKEYAN and ESWARI)
INSERT INTO public.students (id, reg_no, name, role, login_time, is_online, technical_score, aptitude_score, overall_score, total_time, created_at)
VALUES 
  (gen_random_uuid(), '621323205024', 'KARTHIKEYAN', 'ADMIN', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621323205015', 'ESWARI', 'ADMIN', NOW(), FALSE, 0, 0, 0, 0, NOW());

-- Insert All 68 Students from II Year Batch 2024-28 PDF
INSERT INTO public.students (id, reg_no, name, role, login_time, is_online, technical_score, aptitude_score, overall_score, total_time, created_at)
VALUES 
  (gen_random_uuid(), '621324205001', 'ABINIVESH K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205002', 'AKASH R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205003', 'AKKSHETHA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205004', 'ANUSRI K S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205005', 'BRINDHA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205006', 'DHANUSHYA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205007', 'DHARANI R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205008', 'DHARANIYA L', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205009', 'DHARSHINI A', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205010', 'DHARSHINI D', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205011', 'DHEENA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205012', 'DHEIVAPRATHAP P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205013', 'DHIVYA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205014', 'DIVYA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205015', 'FASHEEHA R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205016', 'GIRIJA R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205017', 'GOKUL S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205018', 'HARINI C', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205019', 'HARSATH S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205020', 'JAGAN S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205022', 'JEYASHREE S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205023', 'KANIKA B', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205024', 'KARTHIKA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205025', 'KAVINESH V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205026', 'LOGESHWAR S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205027', 'MADHESH V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205028', 'MADHU PRASATH M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205029', 'MADHUSHREE K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205030', 'MALINI V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205031', 'MANGAIYARKARASI K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205032', 'MEENATCHI V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205033', 'MOHAMED NIYAMATHULLAH S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205034', 'MOHANRAJA V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205035', 'MOSITHA T S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205036', 'NAVITHA S S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205037', 'NEHA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205038', 'NIROSHINI R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205039', 'NISA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205040', 'PALIN JOYAL P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205041', 'PARKAVI K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205042', 'PRASANTH T', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205043', 'PRAVEEN M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205044', 'PRIYA D', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205045', 'RAYEESA IFFATH A', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205046', 'RITHIKA R', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205047', 'ROHITH K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205048', 'SAJITH L', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205049', 'SANDHYA J', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205050', 'SANJANA P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205051', 'SANTHIYA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205052', 'SARANYA K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205053', 'SARATHKUMAR S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205054', 'SHASRUTHA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205055', 'SREEMITHRA A', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205056', 'SRI KAVITHA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205057', 'SRI RAM G', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205058', 'SRIMANRAJ V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205059', 'SURIYA M', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205060', 'SWETHA S', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205061', 'VETRI SELVAM V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205062', 'VIKHASH J', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205063', 'VIMALESH V', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205301', 'DHARANISH M K', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205302', 'DHAYANITHI P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205303', 'GOKUL G', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205304', 'MATHAN P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205305', 'RANJITH KUMAR P', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW()),
  (gen_random_uuid(), '621324205306', 'SARAN B', 'STUDENT', NOW(), FALSE, 0, 0, 0, 0, NOW());

-- Re-enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Verify the inserts - should show CORRECT names
SELECT 
  role,
  COUNT(*) as count
FROM public.students
GROUP BY role
ORDER BY role;

-- Show all admins
SELECT reg_no, name, role 
FROM public.students 
WHERE role = 'ADMIN'
ORDER BY name;

-- Show first 20 students to verify correct names
SELECT reg_no, name, role 
FROM public.students 
WHERE role = 'STUDENT'
ORDER BY reg_no
LIMIT 20;
