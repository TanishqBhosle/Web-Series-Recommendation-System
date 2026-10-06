Product Requirements Document (PRD)

Hybrid Web Series Recommendation System

1. Executive Summary

The Hybrid Web Series Recommendation System is a personalized
recommendation engine that combines:

Content-Based Filtering (CBF)

Collaborative Filtering (CF)

Pearson Correlation as the similarity metric

Weighted hybrid scoring

Cold-start fallback logic

The goal is to provide relevant, diverse, and accurate recommendations
while addressing limitations such as:

Cold-start problems in Collaborative Filtering

Over-specialization in Content-Based Filtering

Important implementation boundary: Model training and offline
model generation will be performed separately in Google Colab. The
web application must not train the recommendation model. The backend
will load and use the trained/generated artifacts supplied by the
project owner.

2. Product Goals

The system should:

Provide personalized recommendations.

Combine content information and user interaction information.

Use Pearson Correlation for similarity calculations.

Support cold-start users and items.

Provide recommendations through a web application.

Provide fast recommendation responses.

Support offline evaluation using standard recommendation metrics.

Keep model training separate from the production web application.

3. Target Dataset

The system uses the MovieLens Latest Small Dataset
(ml-latest-small) from GroupLens.

Core files

movies.csv

Fields:

movieId

title

genres

ratings.csv

Fields:

userId

movieId

rating

timestamp

Rating scale:

0.5 to 5.0

tags.csv

Fields:

userId

movieId

tag

timestamp

The MovieLens dataset is used as the development dataset for the
recommendation engine.

4. System Architecture

The overall system is divided into two major parts.

A. Offline ML / Google Colab

The Google Colab notebook is responsible for:

Data loading

Data preprocessing

Metadata feature extraction

TF-IDF generation

Content-based similarity computation

Collaborative filtering computation

Pearson correlation computation

Hybrid recommendation logic

Cold-start logic

Offline model evaluation

Exporting required model/artifact files

The project owner will provide the Google Colab .ipynb.

The web application must not recreate or retrain this notebook.

B. Web Application

The web application is responsible for:

User authentication

User interface

Movie/web-series search

Movie/web-series details

User ratings

Recommendation requests

Loading trained artifacts

Returning recommendations

Displaying recommendation results

Displaying available model/evaluation information

Architecture:

Google Colab
    |
    | Train / preprocess / generate artifacts
    v
Model Artifacts
    |
    v
FastAPI Backend
    |
    +---- Authentication
    +---- Database
    +---- Recommendation Service
    +---- Movie Service
    |
    v
REST API
    |
    v
React Frontend
    |
    +---- Landing Page
    +---- Login/Register
    +---- User Dashboard
    +---- Search
    +---- Item Details
    +---- Recommendations
    +---- Data Scientist Dashboard

5. Recommendation Methodology

5.1 Content-Based Filtering

Content-Based Filtering uses item metadata.

The system combines:

Genres

User tags

into a composite textual representation.

Example:

Action|Adventure|Sci-Fi + space + future + technology

TF-IDF is then used to convert the textual metadata into numerical
feature vectors.

The similarity between content vectors is calculated using the Pearson
Correlation Coefficient.

5.2 Collaborative Filtering

Collaborative Filtering uses user-item rating interactions.

For two items, their rating vectors are compared across users who rated
both items.

Before calculating Pearson correlation, ratings are mean-centered as
required by the recommendation methodology.

The resulting item-item Pearson similarities are used to identify items
with similar user-rating behavior.

5.3 Pearson Correlation

Pearson Correlation measures the strength and direction of the linear
relationship between two vectors.

For vectors X and Y:

r =
Σ((Xi - X̄)(Yi - Ȳ))
--------------------------------
sqrt(Σ(Xi - X̄)² × Σ(Yi - Ȳ)²)

Pearson correlation is used for:

Collaborative Filtering

Compare item rating vectors across co-rating users after mean-centering.

Content-Based Filtering

Compare TF-IDF feature vectors generated from genre and tag metadata.

6. Hybrid Recommendation

The system combines Content-Based and Collaborative similarities using a
weighted hybrid scheme.

FinalScore(s) =
    α × SimCBF(s_seed, s)
    +
    (1 − α) × SimCF(s_seed, s)

Where:

SimCBF = Content-Based Filtering similarity

SimCF = Collaborative Filtering similarity

α = weighting parameter

s_seed = seed item

s = candidate item

Default α

α = 0.5

This gives equal weight to both recommendation approaches.

7. Cold-Start Strategy

7.1 New / Cold-Start User

If a user has rated fewer than 3 items:

α = 1.0

This means the recommendation system uses:

100% Content-Based Filtering

because there is insufficient collaborative interaction history.

7.2 Cold-Start Item

If an item has fewer than 5 user ratings, the system should rely
primarily on Content-Based similarities for that item.

The exact implementation should follow the supplied Google Colab model.

8. Functional Requirements

FR-01 --- Data Ingestion

The system must support loading:

Rating interactions

Movie/item metadata

Genres

User tags

FR-02 --- Metadata Feature Extraction

The offline ML pipeline must:

Read genres.

Read user tags.

Combine relevant metadata.

Generate composite text representations.

Calculate TF-IDF representations.

The web backend must consume the resulting artifacts rather than
retraining them.

FR-03 --- Similarity Computation

The ML pipeline must pre-compute item-item similarity information for:

Content features

User interaction/rating information

using Pearson correlation.

The backend should load the generated similarity artifacts when the
application starts.

FR-04 --- Hybrid Scoring Engine

The recommendation service must:

Receive the relevant user/item information.

Retrieve available CBF similarities.

Retrieve available CF similarities.

Apply the hybrid weighting.

Apply cold-start rules.

Rank candidates.

Return the top recommendations.

FR-05 --- User Authentication

The application must support:

Registration

Login

Logout

Protected user routes

Authenticated API requests

Passwords must never be stored as plain text.

FR-06 --- User Ratings

Authenticated users should be able to:

Rate items

View their ratings

Update ratings where supported

Rating scale:

0.5 to 5.0

FR-07 --- Recommendation API

The backend must expose an API for obtaining recommendations.

Example:

GET /api/recommendations

The endpoint should return ranked recommendation results.

The exact request/response structure should match the actual model
integration.

FR-08 --- Item Search

Users should be able to search for items by:

Title

Genre

Tags where supported

FR-09 --- Item Details

The application should display:

Title

Genres

Tags

Rating information where available

Similar/recommended items

FR-10 --- Similar Items

The application should provide similar-item recommendations based on the
trained recommendation artifacts.

9. Frontend Requirements

The frontend should be built as a modern responsive web application.

Recommended technology:

React

Vite

JavaScript or TypeScript

Modern CSS or Tailwind CSS

9.1 Landing Page

The landing page should contain:

Navigation bar

Product/application name

Hero section

Product description

Get Started button

Login button

How It Works

Features

Explanation of hybrid recommendations

Footer

9.2 Login Page

Fields:

Email/username

Password

Actions:

Login

Navigate to registration

9.3 Registration Page

Fields:

Name

Email

Password

Confirm Password

9.4 User Dashboard

The dashboard should display:

Personalized recommendations

Search

User profile

User rating history

Similar/recommended items

Logout

Example sections:

Recommended For You
Recently Rated
Similar Items
Explore

9.5 Recommendation Cards

Each recommendation card should support:

Poster/image when available

Title

Genres

Recommendation score where available

Details button

The UI should not invent recommendation scores.

9.6 Item Details Page

Display:

Title

Genres

Tags

Rating

Item information

Similar items

Rating control for authenticated users

10. Backend Requirements

Recommended backend:

Python + FastAPI

The backend must provide:

REST APIs

Authentication

Database access

Recommendation service

Model artifact loading

Search

Ratings

Error handling

CORS configuration

11. Recommended Backend Structure

backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── movies.py
│   │   ├── ratings.py
│   │   └── recommendations.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── movie.py
│   │   └── rating.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── movie.py
│   │   ├── rating.py
│   │   └── recommendation.py
│   │
│   ├── services/
│   │   ├── recommendation_service.py
│   │   ├── model_loader.py
│   │   └── movie_service.py
│   │
│   └── db/
│       ├── database.py
│       └── crud.py
│
├── artifacts/
├── requirements.txt
├── .env.example
└── README.md

This structure may be adapted based on the actual Google Colab artifact
requirements.

12. Model Artifact Integration

The project owner will upload the trained Google Colab notebook.

The backend must inspect and use the artifacts actually generated by
that notebook.

Possible artifact types include:

.pkl

.joblib

.npy

.npz

.csv

TF-IDF vectorizers

Item mappings

Similarity data

Recommendation mappings

Configuration/metric files

Do not assume artifact filenames.

Do not create fake artifacts.

Do not retrain the model in FastAPI.

Create a model-loading layer that loads the actual artifacts generated
by the notebook.

13. Model Loader

Create:

app/services/model_loader.py

Responsibilities:

Load model artifacts at application startup.

Validate that required artifacts exist.

Keep reusable artifacts in memory when practical.

Avoid repeatedly loading large files for each API request.

Provide loaded objects to the recommendation service.

If required artifacts are missing, return a clear configuration error
instead of silently generating fake data.

14. Recommendation Service

Create:

app/services/recommendation_service.py

Responsibilities:

Connect backend APIs with the trained recommendation artifacts.

Retrieve relevant similarities.

Apply hybrid scoring.

Apply cold-start logic.

Rank recommendations.

Exclude invalid results.

Return recommendation data in API-friendly format.

The recommendation service must follow the actual implementation from
the Google Colab notebook.

15. API Requirements

Minimum API structure:

Authentication

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Movies

GET /api/movies
GET /api/movies/{movie_id}
GET /api/movies/search?q={query}

Ratings

POST /api/ratings
GET  /api/ratings/me

Recommendations

GET /api/recommendations
GET /api/recommendations/{movie_id}

Additional endpoints may be added when required.

16. Database

Use a relational database.

For initial development:

SQLite

The architecture should allow migration to PostgreSQL later.

Users

id
name
email
password_hash
created_at

Movies

movie_id
title
genres

Ratings

id
user_id
movie_id
rating
created_at

Do not unnecessarily duplicate large ML artifacts into the database.

17. Data Scientist / Admin Dashboard

Create a separate Data Scientist/Admin dashboard.

The dashboard should display information that actually exists in the
project.

Possible sections:

Dataset Statistics

Number of users

Number of movies/items

Number of ratings

Number of tags

Model Information

Content-Based Filtering

Collaborative Filtering

Pearson Correlation

Hybrid weighting

α value

Cold-start strategy

Evaluation Metrics

Display available:

MAE

RMSE

Precision@5

Recall@5

Never fabricate metric values.

If a metric is not produced by the Colab notebook:

Not available

18. No Model Training in Web Application

This is a strict requirement.

The production application must NOT contain:

Training buttons

Automatic model training

Model retraining on server startup

Dataset retraining through API requests

Fake training progress

Fake training metrics

Training remains an offline Google Colab responsibility.

Architecture:

Google Colab
    ↓
Training / preprocessing
    ↓
Export model artifacts
    ↓
Backend artifacts/
    ↓
FastAPI inference

19. Environment Configuration

Create:

.env.example

Example variables:

DATABASE_URL=sqlite:///./app.db
SECRET_KEY=change-this-secret
JWT_ALGORITHM=HS256
MODEL_ARTIFACT_PATH=./artifacts
FRONTEND_URL=http://localhost:5173

Do not commit real secrets.

20. Security Requirements

The application must:

Hash passwords.

Use secure authentication.

Protect authenticated routes.

Validate API inputs.

Configure CORS correctly.

Keep secrets in environment variables.

Avoid exposing internal file paths.

Avoid exposing model artifacts directly to the frontend.

21. Performance Requirements

The recommendation API should target:

< 200 ms

for recommendation generation under normal local deployment conditions
after model artifacts are loaded.

Performance techniques:

Load artifacts once.

Cache reusable objects.

Avoid repeated disk access.

Use efficient database queries.

Return only the required recommendations.

Do not send full similarity matrices to the frontend.

22. Accuracy / Evaluation Requirements

Offline evaluation should support:

MAE

RMSE

Precision@5

Recall@5

These metrics should be generated by the offline ML pipeline where
implemented.

The web application should display the actual exported metrics rather
than creating its own fake results.

23. Error Handling

The system must gracefully handle:

Invalid login

Duplicate registration

Invalid movie ID

Invalid rating

Missing model artifacts

Invalid recommendation request

Empty recommendation results

Database errors

Backend unavailable

Authentication errors

API responses should contain useful error messages.

24. UI/UX Requirements

The frontend should be:

Modern

Professional

Responsive

Clean

Easy to navigate

Mobile-friendly

Required states:

Loading

Empty

Error

Success

Use reusable components.

Avoid a basic unstyled academic-project appearance.

25. Final Project Structure

hybrid-web-series-recommendation/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── backend/
│   ├── app/
│   ├── artifacts/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── data/
│
├── docs/
│
├── .gitignore
└── README.md

The Google Colab notebook should remain separate from the web
application's training/inference source unless explicitly added by the
project owner.

26. Development Workflow

Antigravity should follow this order:

Step 1 --- Inspect

Read:

prd.md

Existing project files

Dataset files

Uploaded Google Colab .ipynb

Step 2 --- Understand ML Integration

Identify:

Inputs

Outputs

Model artifacts

Recommendation functions

Similarity structures

Cold-start implementation

Evaluation metrics

Step 3 --- Backend

Build:

FastAPI application

Database

Authentication

Model loader

Recommendation service

APIs

Step 4 --- Frontend

Build:

Landing page

Login

Registration

User dashboard

Search

Item details

Recommendations

Data Scientist dashboard

Step 5 --- Integration

Connect:

React → FastAPI → Recommendation Service → Model Artifacts

Step 6 --- Testing

Test:

Registration

Login

Authentication

Search

Ratings

Recommendations

Cold-start behavior

Model artifact loading

API errors

Responsive UI

Step 7 --- Documentation

Create:

Setup instructions

Environment setup

Backend setup

Frontend setup

Model artifact setup

API documentation

Project architecture

27. Acceptance Criteria

The project is considered complete when:

Landing page works.

Registration works.

Login works.

JWT/protected authentication works.

User dashboard works.

Movie/item search works.

Item details work.

Users can submit ratings.

Recommendation API works.

Backend loads the actual Colab-generated artifacts.

Hybrid recommendation logic works according to the supplied
model.

Cold-start behavior works.

Data Scientist dashboard works.

Real evaluation metrics are displayed when available.

No fake ML metrics are used.

No model training occurs in the web application.

Frontend and backend communicate correctly.

Environment variables are configured.

Secrets are not hardcoded.

README contains complete setup instructions.

Application runs successfully locally.

28. Critical Instructions for Antigravity

Do not create the Google Colab training notebook.

Do not train any ML model.

I will upload the Google Colab .ipynb myself.

Inspect the .ipynb before implementing model integration.

Treat the uploaded notebook as the source of truth for ML
implementation.

Do not invent model artifacts.

Do not invent evaluation metrics.

Do not replace Pearson Correlation with another similarity method
unless explicitly requested.

Do not change the hybrid methodology without permission.

Keep training and web application inference completely separate.

Build the frontend and backend around the actual trained
artifacts.

If the notebook is missing something required by the web
application, clearly report what is missing instead of silently
creating a different ML solution.

Maintain clean folder structure and environment configuration.

Write production-quality, readable code.

Test the complete frontend → backend → recommendation pipeline
before considering the project finished.