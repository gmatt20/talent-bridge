# Talent Bridge

> See [PLAN.md](./PLAN.md) for the project plan and [ARCHITECTURE.md](./ARCHITECTURE.md) for structure, local setup, and the API reference.

## Inspiration

One of our team members teaches STEAM at Dreams for Schools, where students
learn technology through hands-on, project-based education. At a networking
event, they met the board members from the Community Innovations Foundation
(CIF) and discovered mutual connections between CIF and Dreams for Schools.
CIF's Innovators Lab connects businesses, students, and mentors on
real community projects. Our talented team realized the connections weren't the hard
part, the coordination was. That gap is what we set out to close.

## What it does

Talent Bridge is a volunteer-run platform where businesses and
nonprofits post real project challenges in plain language, AI structures
those challenges into a clear brief, and students get matched to projects
based on their skills and interests. Each match comes with a plain-English
reason, not just a score. Students apply, organizations review and accept,
and a team is formed around the project.

## How we built it

We split the work across four areas with a shared API contract everyone
builds against: a React + TypeScript frontend (Tailwind + shadcn/ui), a
Python backend serving a REST API backed by Postgres, and an AI layer on
AWS Bedrock that turns raw challenge text into a structured brief and
produces the student/partner match recommendations. The fourth role focused on
wiring the pieces together end-to-end so the full journey actually works as
one flow, not four disconnected parts.

## Challenges we ran into

<!-- TODO -->

## Accomplishments that we're proud of

<!-- TODO -->

## What we learned

<!-- TODO -->

## What's next for Talent Bridge

<!-- TODO -->

## Built With

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Python, PostgreSQL, AWS
Bedrock, boto3, uv

## Try it out

- [GitHub Repo](https://github.com/gmatt20/talent-bridge)
