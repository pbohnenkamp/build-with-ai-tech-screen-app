# Exercise 2 AI Tagging
This branch contains a working version of the application started in exercise 1. It has a new button on the tag-technologies page backed by an API call in server.js to use an AI to tag the technologies. It also has some testing features to help with this exercise.

## Step 1 - Initial API Call
Implement the getTagsFromJobDescription method in src/main/js/ai-tagging.js using the model of your choice.
This will involve:
1. Installing the appropriate API for your model
    - For [Claude](https://docs.anthropic.com/en/docs/initial-setup)
        ```
        npm install @anthropic-ai/sdk
        ```
    - For [OpenAPI](https://platform.openai.com/docs/quickstart?api-mode=chat)
        ```
        npm install openai
        ```
    - For [Google Gemini](https://ai.google.dev/gemini-api/docs#javascript)
        ```
        npm install  @google/genai
        ```
1. Making the API Key available to your application, see above links for documentation.
1. Create a prompt and call the API. For this step, do not worry too much about tuning the prompt. Just ensure that the prompt returns some tags and the results are in a structured way you can parse. I would suggestion a JSON string array. Each API has its own way of returning structured results:
    - [Claude Structured Output Example](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb)
    - [OpenAI Structured Output](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat)
    - [Google Gemini](https://ai.google.dev/gemini-api/docs/structured-output?lang=node)
1. Parse the prompt result and retun a string array of the tagged technologies.


## Step 2 - Testing and Tuning
Now that you have a working AI API call it is time to see that the prompt is returning the results that you want.
### Tooling
I have created a testing data set at /src/test/resources/training-screens. I have also created a UI to manage the test data and preview/compare the AI results, http://localhost:3000/ai-testing/. Finally, there is a bulk test runner that you can use to run mulitple tests at a time:
```
Process all files (default behavior)
node src/test/js/ai-tagging-batch-test-runner.js

# Start from the 10th file and process all remaining files
node src/test/js/ai-tagging-batch-test-runner.js 10

# Start from the 10th file and process only 5 files
node src/test/js/ai-tagging-batch-test-runner.js 10 5

# Show help information
node src/test/js/ai-tagging-batch-test-runner.js --help
```
### Testing and Tuning Guide
#### Create some test data
I have provided 60 test job decriptions from various sources. You will see that sometimes I am asked to screen for multiple roles at a time. Also, sometimes I am asked about specific technologies the recruiter knows will be coming up but doesn't have a the specific job description yet.

The first 10 test job descriptions do not have any tags on them. Go ahead and get some practice tagging them yourself. I have found this experience helps with engineering the LLM query later. Use the [Testing Features](http://localhost:3000/ai-testing/index.html) to do this.

##### How do we standardize the tags?
You may quickly realize that job descriptions are not standardized. However, you want to maintain some consistency with the tags in the question-repo so the questions can be pulled correctly. For example, one description may say RESTful API, another REST, another REST APIs. You want the AI to use the same term you have already used in the question-repo. How will you solve for this. (Hint, maybe that is what the augmentationInput is for. Can you ask the AI to standardize to a dynamic list you add to the prompt?)

##### Universal and Throw Away Tags
Note that in my implementation, I always add the tags Agile, Git, and CI/CD because the recruiters would like those skills assessed regardless of the job description. Because of this, I don't care whether the AI returns those tags and they are not on any of my test tags list. There are also some technologies I never want tagged because I cover them in some other way. For example job descriptions may call out Web APIs. I like to cover that with questions in the specific technologies that would one would use to implement those APIs. For a .NET role I ask questions about the specifics of implementing an API with .NET Core. (Hint, maybe a blacklist? Would you even need to add that to the prompt?)

This is the list of tags I purposely left off the testing data:
```
Github
Web APIs
Cloud Services
AI
HTML
Git
Agile
CI/CD
CICD
APIs
SDLC
Web Development
full stack development
Jira
RDBM
```
You don't have to keep this same list but know that you will have to modify the testing data to account for it if you want clean test runs.

#### Iterate!
Run the bulk test runner on test screens 1 - 10.
```
node src/test/js/ai-tagging-batch-test-runner.js 0 10
```

There most likely will be failures. Some may be related to your initial tags, some will be because the prompt needs refining. Make some changes and rerun the tests.

As you get your initial tests to pass, go ahead and see how many of the other test cases you can get to pass.

Some tips:

#### Temperature Parameter
You may want to lower the temperature of the results. In AI prompts "temperature" refers to a parameter that controls the randomness or predictability of the model's output. Lower temperature values (closer to 0) lead to more predictable and deterministic responses, while higher values (closer to 1) encourage more creative and diverse, but potentially less coherent, outputs. 

##### Use the model's own tooling to help
The major models have a prompt playground and are all slightly different. Most of them will suggest how to structure your prompt to get the desired results.
- [Anthropic Dashboard (Claude Models)](https://console.anthropic.com/dashboard)
- [OpenAI Prompt Playground](https://platform.openai.com/playground/prompts)
- [Google Gemini](https://aistudio.google.com/prompts/new_chat)

#### My tech screen style may be different than yours and that is okay
Test jobs 11 - 20 are copies of 1 - 10 with the technologies I have tagged according to my screening style. You can see if your style compares to mine or not, which can affect the results of tests 21 - 60. If your style differs greatly from mine, you probably will have a lot of differences when running the bulk testing utility. You can adjust and match my style or change the test data to match yours.

#### Prompt Caching
Some of the API's allow for prompt caching. When running bulk API calls with similar prompts, you can cache the portion that is the same. This can increase speed and reduce costs. Note that these prompts and outputs are pretty small, I don't expect you to use more than a few dollars worth of tokens.