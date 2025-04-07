# build-with-ai-tech-screen-app
Repo to use in conjunction with Explore DDD 2025 Building with AI: AI-Assisted Development for AI-Powered Solutions Hands-On Session

This application is to assist with candidate technical screens. The goal of a tech screen is to interview a candidate to determine if they are qualified for a role based on the job decription.

## Roles:
- Recruiter: The recruiter is the person who is requesting the tech screen. They will be given the results of the tech screen.
- Interviewer: The interviewer is the person who is responsible for interviewing the candidate. They will fill out the form based on how the candidate did on the questions.
- Candidate: The candidate is the person who is being interviewed.
- Client: The client of the recruiter that created the job description and is looking to hire a new developer

## Ubiquitous Language:
- Tech Screen: A specific instance of a technical screen that has a candidate, job description(s), recruiter, tagged technologies, questions and interview form.
- Job Description: The description of the position the recruiter is trying to fill. Sometimes a job description will be not be from a client. It can be a general set of technologies the recruiter wants to ensure the candidate has for future positions that open up.
- Tagged Technology: A technology called out in the job description, explicitly or implied, that should be asked as part of the technical screen. 
- Question: A question is a question that is asked to the candidate. Questions have an associated experience level that is used to determine the difficulty of the question.
- Question Repository: A repository of saved tagged technologies and the set of questions associated with the specific tagged technology.
- Interview Form: The interview form is a list of questions that are asked to the candidate. The interview form is printed out and filled out by the interviewer in the intitial version of the application. Subsequent versions of the application will allow the interviewer to fill out the interview form electronically.

## The high level workflow will be as follows:
1. The interviewer will navigate to the landing page and press the button to create a new tech screen.
1. The interviewer will navigate to the 'Tech Screen Setup' form and enter the candidate name, the client name and brief description of the role, the tech screen date and time, and the job description.
1. The interview hits the 'Save and Continue' button. This persists the form info and navigates the interview to the 'Tag Technologies' screen.
1. On the Tag Technologies screen, the interviewer uses a read only view of the job description on the left to add tagged technologies to an input on the right.
1. The interviewer may save the tags at any time using the 'Save' button. Once finished, the interviewer uses the 'Save and Manage Questions' button to continue the tech screen setup.
    - Tags should be persisted to the setup info from the 'New Tech Screen Form'
4. Upon clicking the 'Save and Manage Question' button, the Interviewer will navigate to a page where questions will be choosen for each tagged technology.
    - For each technology, the application will search its question repository to pull questions that match the technology.
    - The interviewer can reorder the questions of the tech screen
    - The interview can reorder the tags of the tech screen
    - The interviewer can save the questions to the tech screen at any time
    - The interviewer can save the questions to the question repository for each tag at any time
6. When done with the questions, the interviewer can use the 'Back to List' button to go back to the landing page or continue on to print the interview form.
7. From the landing page, the interviewer can navigate to any step in the process for any of the listed tech screens.

