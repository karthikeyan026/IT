import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cmfzujaurpfdefreqdku.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZnp1amF1cnBmZGVmcmVnZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTg3NDMsImV4cCI6MjA4ODI5NDc0M30.0kRYW9hvMBNB3mfFzYVwqp_hKJ2WwqNGOXC-gtPKfEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin accounts
const ADMINS = [
  { reg_no: '621323205024', name: 'KARTHIKEYAN' },
  { reg_no: '621323205015', name: 'ESWARI' }
];

// Students from PDF (II year name list Batch 2024-28)
const STUDENTS = [
  { reg_no: '621324205001', name: 'ABINIVESH K' },
  { reg_no: '621324205002', name: 'AKASH M' },
  { reg_no: '621324205003', name: 'AKSHAYA B' },
  { reg_no: '621324205004', name: 'ALAGARSAMY E' },
  { reg_no: '621324205005', name: 'BALAJI P' },
  { reg_no: '621324205006', name: 'BANUPRIYA K' },
  { reg_no: '621324205007', name: 'BHUVANESH V' },
  { reg_no: '621324205008', name: 'DHANUSH S' },
  { reg_no: '621324205009', name: 'DHIVYA DHARSHINI R' },
  { reg_no: '621324205010', name: 'DHARANI KUMAR M' },
  { reg_no: '621324205011', name: 'DHARSHINI N R' },
  { reg_no: '621324205012', name: 'GOWRI SHANKAR J' },
  { reg_no: '621324205013', name: 'GOWTHAM J' },
  { reg_no: '621324205014', name: 'GOWTHAM R' },
  { reg_no: '621324205015', name: 'GOWTHAM M' },
  { reg_no: '621324205016', name: 'HARI PRASATH V' },
  { reg_no: '621324205017', name: 'HARI SUDHAN V' },
  { reg_no: '621324205018', name: 'HARIHARAN M' },
  { reg_no: '621324205019', name: 'HARINI J' },
  { reg_no: '621324205020', name: 'HARINI S' },
  { reg_no: '621324205021', name: 'HARINI B' },
  { reg_no: '621324205022', name: 'HARISH S' },
  { reg_no: '621324205023', name: 'JANARTHANAM J' },
  { reg_no: '621324205024', name: 'JANARTHANAN S' },
  { reg_no: '621324205025', name: 'JAYARAM N' },
  { reg_no: '621324205026', name: 'JAYASHREE K' },
  { reg_no: '621324205027', name: 'KAMALI S' },
  { reg_no: '621324205028', name: 'KAMALESH S' },
  { reg_no: '621324205029', name: 'KAVIN E' },
  { reg_no: '621324205030', name: 'KAVIN RAJ V' },
  { reg_no: '621324205031', name: 'KEERTHIKA S' },
  { reg_no: '621324205032', name: 'KEERTHIVASAN K' },
  { reg_no: '621324205033', name: 'KISHORE KUMAR B' },
  { reg_no: '621324205034', name: 'KOUSALYA K' },
  { reg_no: '621324205035', name: 'KOWSALYA M' },
  { reg_no: '621324205036', name: 'KOWSALYA N' },
  { reg_no: '621324205037', name: 'KRISHNA PRASANTH B' },
  { reg_no: '621324205038', name: 'KRITHIKA M R' },
  { reg_no: '621324205039', name: 'LINGESHWARAN D' },
  { reg_no: '621324205040', name: 'MAGESH S' },
  { reg_no: '621324205041', name: 'MAHESWARAN S' },
  { reg_no: '621324205042', name: 'MOHAN RAJ R' },
  { reg_no: '621324205043', name: 'MOHANA PRIYA R' },
  { reg_no: '621324205044', name: 'MONISHA A' },
  { reg_no: '621324205045', name: 'NANDHINI S' },
  { reg_no: '621324205046', name: 'NANDHINI S' },
  { reg_no: '621324205047', name: 'NAREN R' },
  { reg_no: '621324205048', name: 'NITHISH KUMAR R' },
  { reg_no: '621324205049', name: 'POOJA M' },
  { reg_no: '621324205050', name: 'POOJA P' },
  { reg_no: '621324205051', name: 'POOJA SHREE S' },
  { reg_no: '621324205052', name: 'POOVARASAN R' },
  { reg_no: '621324205053', name: 'PRAKASH S' },
  { reg_no: '621324205054', name: 'PRANESH A' },
  { reg_no: '621324205055', name: 'PRAVEENA P' },
  { reg_no: '621324205056', name: 'PREETHI M' },
  { reg_no: '621324205057', name: 'PRIYADHARSHINI K' },
  { reg_no: '621324205058', name: 'PRIYADHARSHINI S' },
  { reg_no: '621324205059', name: 'RUBAVATHI B' },
  { reg_no: '621324205060', name: 'SABARI A' },
  { reg_no: '621324205061', name: 'SANJAY KRISHNA K' },
  { reg_no: '621324205062', name: 'SANTHOSH G' },
  { reg_no: '621324205063', name: 'SARANYA V' },
  { reg_no: '621324205064', name: 'SARBESH P' },
  { reg_no: '621324205065', name: 'SASI REKHA M' },
  { reg_no: '621324205066', name: 'SIVARANJANI K' },
  { reg_no: '621324205067', name: 'SMARTHA K S' },
  { reg_no: '621324205068', name: 'SOUNDARYA M' },
  { reg_no: '621324205069', name: 'SOUNDHARYA S' },
  { reg_no: '621324205070', name: 'SRI HARIESH M' },
  { reg_no: '621324205071', name: 'SUGANTHI R' },
  { reg_no: '621324205072', name: 'SURIYA PRAKASH E' },
  { reg_no: '621324205073', name: 'SWATHI R' },
  { reg_no: '621324205074', name: 'THARUN KUMAR N' },
  { reg_no: '621324205075', name: 'THENMOZHI R' },
  { reg_no: '621324205076', name: 'THIRUMAL S' },
  { reg_no: '621324205077', name: 'VAISHALI G S' },
  { reg_no: '621324205078', name: 'VAISHALI J' },
  { reg_no: '621324205079', name: 'VAISHNAVI M S' },
  { reg_no: '621324205080', name: 'VETRIVEL N' },
  { reg_no: '621324205081', name: 'VIJAY E' },
  { reg_no: '621324205082', name: 'VIJAY S' },
  { reg_no: '621324205083', name: 'VIGNESWARAN S' },
  { reg_no: '621324205084', name: 'VISHAL KUMAR P' }
];

async function setupStudents() {
  console.log('🚀 Starting Supabase student setup...\n');

  // Insert admins
  console.log('📝 Inserting admin accounts...');
  for (const admin of ADMINS) {
    const { data, error } = await supabase
      .from('students')
      .upsert([
        {
          id: uuidv4(),
          reg_no: admin.reg_no,
          name: admin.name,
          role: 'ADMIN',
          login_time: new Date().toISOString(),
          is_online: false,
          technical_score: 0,
          aptitude_score: 0,
          overall_score: 0,
          total_time: 0
        }
      ], { onConflict: 'reg_no' });

    if (error) {
      console.log(`❌ Error inserting admin ${admin.name}: ${error.message}`);
    } else {
      console.log(`✅ Admin added: ${admin.name} (${admin.reg_no})`);
    }
  }

  // Insert students
  console.log('\n📝 Inserting student accounts...');
  let successCount = 0;
  let errorCount = 0;

  for (const student of STUDENTS) {
    const { data, error } = await supabase
      .from('students')
      .upsert([
        {
          id: uuidv4(),
          reg_no: student.reg_no,
          name: student.name,
          role: 'STUDENT',
          login_time: new Date().toISOString(),
          is_online: false,
          technical_score: 0,
          aptitude_score: 0,
          overall_score: 0,
          total_time: 0
        }
      ], { onConflict: 'reg_no' });

    if (error) {
      console.log(`❌ Error: ${student.name} (${student.reg_no}): ${error.message}`);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Successfully inserted ${successCount} students`);
  if (errorCount > 0) {
    console.log(`❌ Failed to insert ${errorCount} students`);
  }

  console.log('\n🎉 Setup complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Admins: ${ADMINS.length}`);
  console.log(`   - Students: ${STUDENTS.length}`);
  console.log(`   - Total: ${ADMINS.length + STUDENTS.length}`);
}

setupStudents().catch(console.error);
