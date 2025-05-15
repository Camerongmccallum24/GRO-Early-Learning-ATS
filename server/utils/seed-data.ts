import { storage } from '../storage';

/**
 * Seed initial sample data for the application
 */
export async function seedSampleData() {
  console.log("Checking for existing data and seeding if necessary...");
  
  // Create admin user if it doesn't exist
  try {
    const adminUser = await storage.getUser("123456789");
    if (!adminUser) {
      console.log("Creating admin user...");
      await storage.upsertUser({
        id: "123456789",
        email: "hr-admin@groearlylearning.com",
        firstName: "HR",
        lastName: "Admin",
        profileImageUrl: "https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff",
        role: "hr_admin"
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
  
  // Check if candidates exist
  const candidates = await storage.getCandidates();
  if (candidates.length === 0) {
    console.log("No candidates found. Adding sample candidates...");
    
    const sampleCandidates = [
      {
        name: "Emma Johnson",
        email: "emma.johnson@example.com",
        phone: "07123456789",
        location: "Brisbane, QLD",
        education: "Bachelor of Education (Early Childhood)\nQueensland University of Technology, 2020",
        experience: "Lead Educator - Brisbane Childcare Centre\nJanuary 2020 - Present\n\nAssistant Educator - Sunshine Learning Centre\nJune 2018 - December 2019",
        skills: "Early childhood curriculum, Behavior management, Parent communication, First aid certified, Creative activities planning",
        certifications: "Working with Children Check, First Aid and CPR, Child Protection Training",
        summary: "Dedicated early childhood educator with 5 years of experience creating engaging learning environments for children aged 0-5 years.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        phone: "07987654321",
        location: "Gold Coast, QLD",
        education: "Diploma of Early Childhood Education and Care\nTAFE Queensland, 2019",
        experience: "Room Leader - Gold Coast Early Learning\nMarch 2019 - Present\n\nChildcare Assistant - Tiny Tots Daycare\nJanuary 2017 - February 2019",
        skills: "Curriculum planning, Documentation of learning, Cultural inclusion practices, Music and movement activities",
        certifications: "Working with Children Check, First Aid Certificate, Food Handling Certificate",
        summary: "Enthusiastic and patient early childhood educator with strong focus on creating inclusive environments for children from diverse backgrounds.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        phone: "07456789123",
        location: "Sunshine Coast, QLD",
        education: "Master of Education (Early Childhood)\nGriffith University, 2018\n\nBachelor of Child Development\nUniversity of Queensland, 2016",
        experience: "Center Director - Sunshine Coast Kids\nJuly 2021 - Present\n\nEducational Leader - Bright Stars Early Learning\nFebruary 2018 - June 2021\n\nEarly Childhood Teacher - Little Learners\nJanuary 2016 - January 2018",
        skills: "Leadership, Staff mentoring, Regulatory compliance, Educational programming, Budget management, Parent partnerships",
        certifications: "Teacher Registration (QCT), Working with Children Check, Advanced First Aid, Child Protection Training",
        summary: "Experienced early childhood leader with over 8 years in the sector and a strong passion for quality education and care. Skilled in center management and staff development.",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const candidate of sampleCandidates) {
      await storage.createCandidate(candidate);
    }
    
    console.log("Sample candidates added successfully");
  } else {
    console.log(`${candidates.length} candidates already exist in the database`);
  }

  // Check if we have locations
  const locations = await storage.getLocations();
  if (locations.length === 0) {
    console.log("No locations found. Adding sample locations...");
    
    const sampleLocations = [
      {
        name: "GRO Early Learning Center - Brisbane CBD",
        city: "Brisbane",
        state: "QLD"
      },
      {
        name: "GRO Early Learning Center - Sunshine Coast",
        city: "Maroochydore",
        state: "QLD"
      },
      {
        name: "GRO Early Learning Center - Gold Coast",
        city: "Southport",
        state: "QLD"
      }
    ];
    
    for (const location of sampleLocations) {
      await storage.createLocation(location);
    }
    
    console.log("Sample locations added successfully");
  } else {
    console.log(`${locations.length} locations already exist in the database`);
  }
  
  // Check if we have job postings
  const jobPostings = await storage.getJobPostings();
  if (jobPostings.length === 0) {
    console.log("No job postings found. Adding sample job postings...");
    
    // Get location IDs
    const locations = await storage.getLocations();
    
    if (locations.length > 0) {
      const sampleJobPostings = [
        {
          title: "Lead Educator",
          locationId: locations[0].id,
          description: "We are seeking a passionate and experienced Lead Educator to join our team at GRO Early Learning Center - Brisbane CBD. The successful candidate will be responsible for implementing educational programs that enhance children's learning and development.",
          requirements: "Diploma or Bachelor's degree in Early Childhood Education, Working with Children Check, First Aid Certificate, Minimum 2 years experience in early childhood settings",
          qualifications: "Diploma of Early Childhood Education and Care or Bachelor of Education (Early Childhood) required",
          employmentType: "full_time",
          salary: "$65,000 - $75,000 per annum",
          status: "active",
          startDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Early Childhood Teacher",
          locationId: locations[1].id,
          description: "GRO Early Learning Center - Sunshine Coast is looking for a dedicated Early Childhood Teacher to design and implement a high-quality educational program for our kindergarten room. You will work collaboratively with other educators to ensure positive outcomes for all children.",
          requirements: "Bachelor's degree in Early Childhood Education, Teacher registration, Working with Children Check, First Aid Certificate, Experience with EYLF and NQS",
          qualifications: "Bachelor of Education (Early Childhood) required, Master's degree preferred",
          employmentType: "full_time",
          salary: "$75,000 - $85,000 per annum",
          status: "active",
          startDate: new Date(new Date().setDate(new Date().getDate() + 21)),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Center Director",
          locationId: locations[2].id,
          description: "We are looking for an experienced Center Director to oversee the operations of our GRO Early Learning Center - Gold Coast location. The successful candidate will be responsible for leading a team of educators, ensuring compliance with regulations, managing budgets, and maintaining high-quality educational programs.",
          requirements: "Bachelor's or Master's degree in Early Childhood Education or related field, Minimum 5 years experience in early childhood education with at least 2 years in a leadership role, Strong understanding of NQF and EYLF, Excellent communication and leadership skills",
          qualifications: "Bachelor of Education (Early Childhood) required, Diploma of Business or Management highly regarded, First Aid Certificate, Child Protection training",
          employmentType: "full_time",
          salary: "$90,000 - $110,000 per annum",
          status: "active",
          startDate: new Date(new Date().setDate(new Date().getDate() + 45)),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      for (const jobPosting of sampleJobPostings) {
        await storage.createJobPosting(jobPosting);
      }
      
      console.log("Sample job postings added successfully");
    } else {
      console.log("Could not add job postings - no locations available");
    }
  } else {
    console.log(`${jobPostings.length} job postings already exist in the database`);
  }
  
  // Check if we have applications
  const applications = await storage.getApplications();
  if (applications.length === 0) {
    console.log("No applications found. Adding sample applications...");
    
    // Get candidates and job postings
    const candidates = await storage.getCandidates();
    const jobPostings = await storage.getJobPostings();
    
    if (candidates.length > 0 && jobPostings.length > 0) {
      const sampleApplications = [
        {
          candidateId: candidates[0].id,
          jobPostingId: jobPostings[0].id,
          status: "interview",
          notes: "Strong candidate with relevant qualifications and experience. Cover Letter: Dear Hiring Manager, I am excited to apply for the Lead Educator position at GRO Early Learning. With my experience in early childhood education and passion for creating engaging learning environments, I believe I would be a great addition to your team. I look forward to the opportunity to discuss how my skills align with your needs. Sincerely, Emma Johnson",
          applicationDate: new Date(new Date().setDate(new Date().getDate() - 7)),
          lastStatusChangeDate: new Date()
        },
        {
          candidateId: candidates[1].id,
          jobPostingId: jobPostings[1].id,
          status: "in_review",
          notes: "Has good experience with diverse learning approaches. Cover Letter: Dear Hiring Team, I am writing to express my interest in the Early Childhood Teacher position. My experience in curriculum planning and inclusive education aligns perfectly with what you're looking for. Thank you for considering my application. Best regards, Michael Chen",
          applicationDate: new Date(new Date().setDate(new Date().getDate() - 3)),
          lastStatusChangeDate: new Date()
        },
        {
          candidateId: candidates[2].id,
          jobPostingId: jobPostings[2].id,
          status: "applied",
          notes: "Very experienced candidate with management background. Cover Letter: Dear GRO Early Learning, I am applying for the Center Director position. With my extensive experience in early childhood leadership and center management, I am confident I can contribute to your organization's success. I am particularly drawn to your focus on growth, care, and community values. Sincerely, Sarah Williams",
          applicationDate: new Date(new Date().setDate(new Date().getDate() - 1)),
          lastStatusChangeDate: new Date()
        }
      ];
      
      for (const application of sampleApplications) {
        await storage.createApplication(application);
      }
      
      console.log("Sample applications added successfully");
    } else {
      console.log("Could not add applications - no candidates or job postings available");
    }
  } else {
    console.log(`${applications.length} applications already exist in the database`);
  }
}