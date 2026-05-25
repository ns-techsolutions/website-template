# GitHub Workflow Definition

# Website Template Platform

**Organization:** NS-TechSolutions  
**Project:** Website Template Platform  
**Document Type:** GitHub Workflow Definition  
**Recommended Path:** `docs/development/github-workflow-definition.md`  
**Version:** v0.1  
**Status:** Draft

---

# 1. Purpose

This document defines the GitHub-based project-management and development workflow for the Website Template Platform.

The purpose of this workflow is to provide a clear and professional process for:

- Creating tasks
- Assigning work
- Tracking developer progress
- Managing pull requests
- Reviewing work
- Closing completed tasks
- Maintaining visibility across the project

This document is especially important for future contractors and developers who will work on the project.

---

# 2. Workflow Scope

This workflow covers:

- GitHub Issues
- GitHub Project board
- Task assignment
- Issue status movement
- Branch creation
- Pull request submission
- Review process
- Issue closure
- Release preparation

This workflow does not define detailed coding standards or deployment steps. Those are documented separately.

Related documents:

```text
docs/development/coding-standards.md
docs/development/branching-and-pr-strategy.md
docs/deployment/deployment-documentation.md
docs/release-notes/release-notes-strategy.md
```

---

# 3. GitHub Workflow Overview

The project uses GitHub as the central platform for:

- Source code management
- Task management
- Pull request review
- Documentation storage
- Release tracking

The workflow follows this lifecycle:

```text
Issue Created
↓
Issue Assigned
↓
Developer Starts Work
↓
Feature Branch Created
↓
Pull Request Opened
↓
Admin Review
↓
Merge Approved
↓
Issue Closed
↓
Task Marked Done
```

---

# 4. GitHub Project Board

# 4.1 Project Board Name

Recommended project name:

```text
Website Template Development
```

---

# 4.2 Project Board Columns

The project board should use four columns:

```text
Todo
In Progress
In Review
Done
```

---

# 4.3 Column Meaning

## Todo

Tasks that are defined but not yet actively being developed.

Used when:

- Admin creates a new task
- Task is ready for assignment
- Task has been assigned but not started

---

## In Progress

Tasks actively being worked on by a developer.

Used when:

- Developer has started implementation
- Feature branch has been created
- Code changes are underway

---

## In Review

Tasks that are ready for admin review.

Used when:

- Developer opens a pull request
- Work is ready for review
- Admin is checking implementation quality

---

## Done

Tasks that are completed.

Used when:

- Pull request is approved
- Code is merged
- Issue is closed
- Documentation is updated where required

---

# 5. Roles and Responsibilities

# 5.1 Administrator Role

The administrator is responsible for:

- Creating issues
- Defining clear task requirements
- Assigning tasks to developers
- Reviewing pull requests
- Requesting changes when needed
- Approving merges
- Closing completed issues
- Maintaining project documentation
- Managing releases
- Controlling deployment

---

# 5.2 Developer Role

Developers are responsible for:

- Reading assigned issues carefully
- Moving tasks to In Progress when work begins
- Creating feature branches
- Implementing assigned work
- Opening pull requests
- Responding to review comments
- Updating documentation where required
- Keeping task scope focused

---

# 6. Issue Creation Workflow

# 6.1 Who Creates Issues?

Only the administrator should create official project tasks initially.

Developers may suggest issues, but official task creation and prioritisation should remain under administrator control.

---

# 6.2 Issue Requirements

Each issue should include:

- Clear title
- Purpose of task
- Expected output
- Acceptance criteria
- Relevant labels
- Assignee
- Project board status

---

# 6.3 Recommended Issue Template

```markdown
# Task Title

## Purpose
Explain why this task is needed.

## Scope
Explain what should be implemented.

## Acceptance Criteria
- Criterion 1
- Criterion 2
- Criterion 3

## Notes
Additional guidance or constraints.
```

---

# 6.4 Example Issue

```markdown
# Create Homepage Navigation Bar

## Purpose
Create a reusable navigation bar for the website template.

## Scope
- Add desktop navigation
- Add mobile-responsive menu structure
- Use Tailwind CSS
- Keep component reusable

## Acceptance Criteria
- Navbar displays correctly on desktop
- Navbar displays correctly on mobile
- Component is stored in components/navigation/
- No hardcoded unnecessary business-specific content

## Notes
Use placeholder links for now.
```

---

# 7. Task Assignment Workflow

# 7.1 Assignment Process

Administrator should:

1. Create issue
2. Add issue to project board
3. Assign developer
4. Set status to Todo
5. Add relevant labels

---

# 7.2 Assignment Rules

- Each task should have one main assignee
- Complex tasks may be split into smaller issues
- Developers should not work on unassigned tasks unless approved
- Priority should be controlled by the administrator

---

# 8. Labels

Recommended GitHub labels:

```text
frontend
backend
documentation
deployment
bug
enhancement
priority-high
priority-medium
priority-low
review-needed
blocked
```

---

# 9. Developer Work Start Process

When a developer starts working on a task:

1. Open assigned issue
2. Read requirements carefully
3. Move issue from Todo to In Progress
4. Create feature branch from dev
5. Begin implementation

Example branch:

```text
feature/homepage-navbar
```

---

# 10. Branch and Pull Request Relationship

Each issue should normally have:

```text
One Issue → One Feature Branch → One Pull Request
```

This keeps work traceable and easy to review.

---

# 11. Pull Request Workflow

# 11.1 Developer PR Process

Developer should:

1. Complete implementation
2. Test changes locally
3. Push feature branch
4. Open pull request into dev
5. Link the related issue
6. Move issue to In Review
7. Request admin review

---

# 11.2 Pull Request Requirements

Each pull request should include:

- Clear title
- Summary of changes
- Related issue number
- Screenshots for UI changes where useful
- Notes about testing completed
- Documentation updates if applicable

---

# 11.3 Recommended PR Template

```markdown
# Summary
Briefly explain what was implemented.

# Related Issue
Closes #issue-number

# Changes Made
- Change 1
- Change 2
- Change 3

# Testing
- Tested locally
- Checked responsive behavior

# Notes
Any additional information for reviewer.
```

---

# 12. Review Workflow

# 12.1 Admin Review Checklist

Administrator should review:

- Does the implementation match the issue scope?
- Is the code readable?
- Is the component reusable?
- Are naming conventions followed?
- Is unnecessary complexity avoided?
- Are there security concerns?
- Is documentation updated if needed?
- Does the UI work on desktop and mobile?

---

# 12.2 Review Outcomes

The administrator may:

```text
Approve
Request Changes
Comment Only
Close PR if unsuitable
```

---

# 13. Merge Workflow

A pull request may be merged when:

- Review is complete
- Required changes are addressed
- Implementation matches acceptance criteria
- No major issues remain
- Documentation is updated if required

After merge:

1. Issue should be closed
2. Task moved to Done
3. Release notes updated if needed

---

# 14. Done Definition

A task is considered Done only when:

- Code is implemented
- Pull request is merged
- Issue is closed
- Documentation is updated where required
- No unresolved review comments remain

---

# 15. Manual vs Automated Board Movement

At the initial project stage, board movement may be manual.

Recommended responsibility:

| Movement | Responsible Person |
|---|---|
| Todo | Admin |
| Todo → In Progress | Developer |
| In Progress → In Review | Developer |
| In Review → Done | Admin |

This is sufficient during the early startup stage.

Automation may be introduced later using GitHub Actions or GitHub Project workflows.

---

# 16. Communication Rules

Developers should communicate through:

- GitHub issue comments
- Pull request comments
- Review comments

Important technical decisions should not remain only in private messages.

If a decision affects architecture, documentation should be updated.

---

# 17. Documentation Workflow

Documentation must be updated when:

- Architecture changes
- API behavior changes
- Deployment steps change
- New reusable components are added
- Release strategy changes

Relevant documentation should be updated in the same pull request where possible.

---

# 18. Release Relationship

GitHub workflow connects to release management as follows:

```text
Issues completed
↓
PRs merged
↓
main branch updated
↓
Release notes prepared
↓
GitHub Release created
↓
Deployment performed
```

---

# 19. Future Workflow Evolution

As the team grows, the workflow may evolve to include:

- Automated project-board movement
- GitHub Actions CI checks
- Automated testing
- Pull request templates
- Issue templates
- Deployment approval workflows
- Staging environment

These are intentionally postponed during the early stage to keep the workflow manageable.

---

# 20. Summary

The GitHub Workflow Definition establishes a simple but professional operating model for the Website Template Platform.

The workflow is based on:

- GitHub Issues
- GitHub Projects
- Feature branches
- Pull requests
- Admin reviews
- Controlled merges
- Release tracking

This workflow is suitable for the current early-stage startup environment and provides a strong foundation for future contractor and developer collaboration.
