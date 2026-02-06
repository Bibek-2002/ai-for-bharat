# Requirements Document

## Introduction

DevMitra is a real-time coding evaluation and intervention engine that acts as an AI mentor for student developers learning to code. The system proactively detects when students are struggling and provides Socratic teaching interventions to guide their learning process.

## Glossary

- **DevMitra_System**: The complete AI-powered learning platform including VS Code extension and web dashboard
- **Struggle_Pattern**: Behavioral indicators showing a student is experiencing difficulty (repeated edits, long pauses, copy-paste behavior)
- **Socratic_Teaching**: Educational method using guided questions rather than direct answers to help students discover solutions
- **Intervention**: AI-generated teaching moment triggered by detected struggle patterns
- **Session**: A continuous coding period tracked by the system for analytics and progress measurement
- **Concept_Mastery**: Quantified understanding level of specific programming concepts (e.g., "async/await: 40% proficiency")
- **Hinglish**: Hindi-English code-switching communication style natural to Indian students

## Requirements

### Requirement 1: Live Struggle Detection

**User Story:** As a student developer, I want the system to automatically detect when I'm struggling with code, so that I can receive timely help without having to ask for it.

#### Acceptance Criteria

1. WHEN a student edits the same line 5 or more times within a 2-minute window, THE DevMitra_System SHALL detect this as a struggle pattern
2. WHEN a student pauses coding for 30 seconds or more on a single line, THE DevMitra_System SHALL identify this as a potential struggle moment
3. WHEN a student performs copy-paste operations from external sources, THE DevMitra_System SHALL flag this behavior for intervention consideration
4. WHEN multiple struggle patterns occur within a 5-minute window, THE DevMitra_System SHALL prioritize the most recent pattern for intervention
5. THE DevMitra_System SHALL process struggle detection within 2 seconds of pattern completion
6. WHEN struggle patterns are detected, THE DevMitra_System SHALL analyze the code context to determine intervention relevance

### Requirement 2: AI-Powered Socratic Teaching

**User Story:** As a student developer, I want to receive guided questions that help me think through problems, so that I can develop independent problem-solving skills rather than just getting answers.

#### Acceptance Criteria

1. WHEN an intervention is triggered, THE DevMitra_System SHALL generate contextual teaching questions based on the current code and struggle pattern
2. THE DevMitra_System SHALL never provide direct code solutions or complete implementations
3. WHEN a student responds to a teaching question, THE DevMitra_System SHALL provide follow-up questions or hints based on their answer
4. THE DevMitra_System SHALL adapt question complexity based on the student's skill level (beginner/intermediate)
5. WHEN communicating with students, THE DevMitra_System SHALL support Hinglish (Hindi-English code-switching) responses
6. WHEN a student remains stuck after 3 teaching exchanges, THE DevMitra_System SHALL provide progressively more specific hints while maintaining the Socratic approach
7. THE DevMitra_System SHALL use culturally relevant examples (chai shops, cricket, Indian context) in teaching explanations

### Requirement 3: Session Analytics Dashboard

**User Story:** As a student developer, I want to visualize my coding session with struggle moments highlighted, so that I can understand my learning patterns and identify areas for improvement.

#### Acceptance Criteria

1. WHEN a coding session is active, THE DevMitra_System SHALL create a real-time timeline visualization of coding activity
2. THE DevMitra_System SHALL display struggle moments as highlighted regions on the coding timeline
3. WHEN displaying session analytics, THE DevMitra_System SHALL show time spent on each coding task or concept
4. THE DevMitra_System SHALL identify and label which programming concepts caused difficulty during the session
5. WHEN a session ends, THE DevMitra_System SHALL generate a visual heatmap showing intensity of struggle across different time periods
6. THE DevMitra_System SHALL provide a web-based dashboard accessible through modern browsers
7. WHEN displaying analytics, THE DevMitra_System SHALL maintain an aesthetically pleasing and intuitive user interface

### Requirement 4: Progress Tracking System

**User Story:** As a student developer, I want to track my concept mastery over multiple sessions, so that I can see my improvement and focus on weak areas.

#### Acceptance Criteria

1. THE DevMitra_System SHALL track concept mastery levels across multiple coding sessions
2. WHEN a student demonstrates understanding of a concept, THE DevMitra_System SHALL update their proficiency score for that concept
3. THE DevMitra_System SHALL identify persistent weak areas where students consistently struggle
4. WHEN displaying progress, THE DevMitra_System SHALL show improvement trends over time for each tracked concept
5. THE DevMitra_System SHALL generate personalized learning path recommendations based on identified weak areas
6. WHEN a student accesses their progress, THE DevMitra_System SHALL display quantified proficiency levels (e.g., "async/await: 40% proficiency")
7. THE DevMitra_System SHALL maintain progress data across multiple sessions and devices

### Requirement 5: VS Code Extension Integration

**User Story:** As a student developer, I want seamless integration with my VS Code environment, so that I can receive mentoring without disrupting my coding workflow.

#### Acceptance Criteria

1. THE DevMitra_System SHALL provide a VS Code extension that monitors code editing patterns in real-time
2. WHEN interventions are triggered, THE DevMitra_System SHALL display teaching content in a VS Code sidebar panel
3. THE DevMitra_System SHALL support JavaScript and React file types for monitoring and analysis
4. WHEN the extension is active, THE DevMitra_System SHALL maintain minimal impact on VS Code performance
5. THE DevMitra_System SHALL require user consent before beginning code monitoring and analysis
6. WHEN students interact with teaching content, THE DevMitra_System SHALL maintain focus within the VS Code environment

### Requirement 6: AI Context Understanding

**User Story:** As a student developer, I want the AI to understand my code's intent and logical errors, so that I receive relevant and meaningful teaching interventions.

#### Acceptance Criteria

1. WHEN analyzing code, THE DevMitra_System SHALL comprehend code intent beyond just syntax checking
2. THE DevMitra_System SHALL identify logical errors and conceptual misunderstandings in student code
3. WHEN generating teaching questions, THE DevMitra_System SHALL consider the full context of the student's code and learning history
4. THE DevMitra_System SHALL adapt teaching style based on individual student's previous interactions and demonstrated skill level
5. WHEN encountering new coding scenarios, THE DevMitra_System SHALL generate appropriate interventions without being limited to pre-programmed responses
6. THE DevMitra_System SHALL maintain response times under 2 seconds for intervention generation

### Requirement 7: Data Privacy and Security

**User Story:** As a student developer, I want my code and learning data to be handled securely and privately, so that I can trust the system with my work.

#### Acceptance Criteria

1. THE DevMitra_System SHALL analyze code in real-time without permanently storing complete source code
2. WHEN transmitting data, THE DevMitra_System SHALL use encrypted connections for all communications
3. THE DevMitra_System SHALL require explicit user consent before collecting any analytics data
4. WHEN storing session data, THE DevMitra_System SHALL anonymize personally identifiable information
5. THE DevMitra_System SHALL provide clear transparency about AI limitations and data usage
6. THE DevMitra_System SHALL allow users to opt-out of data collection while maintaining core functionality

### Requirement 8: System Performance and Scalability

**User Story:** As a student developer, I want the system to respond quickly and reliably, so that my learning flow is not interrupted by technical delays.

#### Acceptance Criteria

1. THE DevMitra_System SHALL support up to 100 concurrent users during the beta phase
2. WHEN processing interventions, THE DevMitra_System SHALL maintain sub-2 second response times
3. THE DevMitra_System SHALL cache common intervention scenarios to improve response performance
4. WHEN the system experiences high load, THE DevMitra_System SHALL gracefully degrade functionality rather than failing completely
5. THE DevMitra_System SHALL maintain 99% uptime during active learning hours (9 AM - 11 PM IST)
6. THE DevMitra_System SHALL require stable internet connection for AI-powered features

## Non-Functional Requirements

### Performance Requirements
- **NFR-1**: System response time for struggle detection: ≤ 2 seconds
- **NFR-2**: AI intervention generation time: ≤ 2 seconds
- **NFR-3**: Dashboard loading time: ≤ 3 seconds
- **NFR-4**: VS Code extension memory usage: ≤ 50MB
- **NFR-5**: Concurrent user support: 100 users (beta phase)

### Security Requirements
- **NFR-6**: All data transmission encrypted using TLS 1.3
- **NFR-7**: User consent required for all data collection
- **NFR-8**: Code analysis performed without permanent storage
- **NFR-9**: Session data anonymized and encrypted at rest
- **NFR-10**: Regular security audits and vulnerability assessments

### Scalability Requirements
- **NFR-11**: Horizontal scaling capability for AWS Lambda functions
- **NFR-12**: DynamoDB auto-scaling for session data storage
- **NFR-13**: CloudFront CDN for global dashboard delivery
- **NFR-14**: API Gateway rate limiting and throttling

### Usability Requirements
- **NFR-15**: Hinglish language support for natural communication
- **NFR-16**: Intuitive dashboard interface requiring minimal training
- **NFR-17**: VS Code extension installation in under 2 minutes
- **NFR-18**: Mobile-responsive dashboard design

### Reliability Requirements
- **NFR-19**: 99% system uptime during peak hours (9 AM - 11 PM IST)
- **NFR-20**: Graceful degradation when AI services are unavailable
- **NFR-21**: Automatic retry mechanisms for failed API calls
- **NFR-22**: Data backup and recovery procedures

## Success Metrics

### Primary Success Metrics
- **Debug time reduction**: From 2.5 hours to under 35 minutes (86% improvement)
- **Concept retention improvement**: From 40% to 82%
- **Copy-paste behavior reduction**: From 65% to 15%
- **Dropout prevention**: From 55% to under 8%

### Secondary Success Metrics
- **User engagement**: 80% of students complete at least 5 sessions
- **Intervention effectiveness**: 70% of interventions lead to successful problem resolution
- **System adoption**: 90% of beta users continue using after 2 weeks
- **Response satisfaction**: 85% positive feedback on AI teaching quality

### Technical Performance Metrics
- **System availability**: 99% uptime during active hours
- **Response time**: 95% of interventions delivered within 2 seconds
- **Error rate**: Less than 1% of API calls result in errors
- **User retention**: 80% monthly active user retention

## Out of Scope

### Explicitly Not Included
- **Multi-language support**: Only JavaScript/React in initial version
- **IDE support**: Only VS Code, no other IDEs
- **Direct code solutions**: System never provides complete implementations
- **Offline functionality**: Requires internet connection for AI features
- **Voice interactions**: Text-based communication only
- **Mobile app**: Web dashboard only, no native mobile application
- **Real-time collaboration**: Single-user sessions only
- **Interview preparation**: Focus on learning, not interview coaching
- **Permanent code storage**: No long-term code repository features
- **Multi-user classrooms**: Individual learning focus only

### Future Scope (Not in Current Requirements)
- Multi-language programming support (Python, Java, C++)
- Voice-based interventions and responses
- Native mobile application
- Real-time collaborative learning features
- Dedicated interview preparation modules
- Integration with learning management systems
- Advanced analytics for educators and institutions