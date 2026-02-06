# Design Document

## Overview

DevMitra is a real-time AI-powered coding mentor system that proactively detects student struggle patterns and provides Socratic teaching interventions. The system consists of a VS Code extension for real-time code monitoring, AWS serverless backend for AI processing, and a web dashboard for analytics visualization.

The architecture follows event-driven serverless patterns, leveraging AWS Lambda for compute, DynamoDB for data persistence, Amazon Bedrock for AI inference, and API Gateway for real-time communication. The system is designed to handle 100 concurrent users during beta with sub-2 second response times.

## Architecture

### High-Level System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VS Code       │    │   AWS Cloud      │    │  Web Dashboard  │
│   Extension     │◄──►│   Backend        │◄──►│   (React)       │
│  (TypeScript)   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │  API Gateway    │             │
         │              │  (REST + WS)    │             │
         │              └────────┬────────┘             │
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │  Lambda         │             │
         │              │  Functions      │             │
         │              └────────┬────────┘             │
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │  Amazon         │             │
         │              │  Bedrock        │             │
         │              │  (Claude)       │             │
         │              └────────┬────────┘             │
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │  DynamoDB       │             │
         │              │  Tables         │             │
         │              └─────────────────┘             │
         │                                               │
         └───────────────────────────────────────────────┘
                    S3 + CloudFront (Dashboard Hosting)
```

### Component Breakdown

#### VS Code Extension (Frontend)
- **Technology**: TypeScript, VS Code Extension API
- **Responsibilities**:
  - Real-time code monitoring using VS Code's TextDocument API
  - Struggle pattern detection (edit frequency, pause duration, copy-paste)
  - UI rendering for teaching interventions in sidebar panel
  - WebSocket connection management for real-time communication
  - Local caching of user preferences and session state

#### API Gateway
- **Technology**: AWS API Gateway (REST + WebSocket)
- **Responsibilities**:
  - REST endpoints for session management, analytics retrieval
  - WebSocket API for real-time intervention delivery
  - Request routing and throttling (100 concurrent connections)
  - CORS configuration for web dashboard access
  - Authentication and authorization handling

#### Lambda Functions
- **Technology**: Python 3.11 runtime
- **Functions**:
  1. **struggle-detector**: Analyzes code patterns and triggers interventions
  2. **ai-teacher**: Generates Socratic questions using Bedrock
  3. **session-manager**: Handles session lifecycle and data persistence
  4. **analytics-processor**: Aggregates data for dashboard visualization
  5. **websocket-handler**: Manages WebSocket connections and message routing

#### Amazon Bedrock Integration
- **Model**: Claude 3.5 Sonnet
- **Features**:
  - Context-aware prompt engineering for teaching interventions
  - Prompt caching for common scenarios (5-minute TTL)
  - Hinglish language support through custom prompts
  - Real-time inference with <2 second response times

#### DynamoDB Tables
- **Sessions**: Stores active coding sessions and struggle events
- **UserProgress**: Tracks concept mastery and learning paths
- **InterventionCache**: Caches common AI responses for performance
- **ConnectionManager**: Manages WebSocket connection states

#### Web Dashboard
- **Technology**: React 18, TypeScript, Recharts for visualization
- **Hosting**: S3 + CloudFront for global delivery
- **Features**:
  - Real-time session timeline with struggle heatmaps
  - Concept mastery tracking and progress visualization
  - Responsive design for mobile and desktop access

## Components and Interfaces

### VS Code Extension Architecture

```typescript
interface StrugglePattern {
  type: 'repeated_edit' | 'long_pause' | 'copy_paste';
  timestamp: number;
  lineNumber: number;
  editCount?: number;
  pauseDuration?: number;
  codeContext: string;
}

interface InterventionRequest {
  sessionId: string;
  userId: string;
  strugglePattern: StrugglePattern;
  codeContext: string;
  userSkillLevel: 'beginner' | 'intermediate';
}

interface TeachingIntervention {
  interventionId: string;
  question: string;
  hints: string[];
  culturalContext?: string;
  followUpQuestions: string[];
}
```

### Lambda Function Interfaces

```python
# struggle-detector function
def lambda_handler(event, context):
    """
    Analyzes incoming code patterns and determines intervention necessity
    Input: StrugglePattern from VS Code extension
    Output: InterventionRequest to ai-teacher function
    """

# ai-teacher function  
def lambda_handler(event, context):
    """
    Generates Socratic teaching questions using Bedrock
    Input: InterventionRequest with code context
    Output: TeachingIntervention with questions and hints
    """

# session-manager function
def lambda_handler(event, context):
    """
    Manages session lifecycle and progress tracking
    Input: Session events (start, end, struggle, resolution)
    Output: Updated session state and progress metrics
    """
```

### DynamoDB Schema Design

#### Sessions Table
```json
{
  "PK": "SESSION#user123#20250115",
  "SK": "METADATA",
  "sessionId": "sess_abc123",
  "userId": "user123",
  "startTime": "2025-01-15T10:00:00Z",
  "endTime": "2025-01-15T11:30:00Z",
  "totalStruggles": 5,
  "conceptsEncountered": ["async/await", "useEffect", "API calls"],
  "skillLevel": "beginner"
}

{
  "PK": "SESSION#user123#20250115", 
  "SK": "STRUGGLE#1642248000",
  "struggleType": "repeated_edit",
  "lineNumber": 42,
  "codeContext": "fetch('api.com')",
  "interventionId": "int_xyz789",
  "resolved": true,
  "resolutionTime": 180
}
```

#### UserProgress Table
```json
{
  "PK": "USER#user123",
  "SK": "CONCEPT#async-await",
  "conceptName": "async/await",
  "proficiencyScore": 0.4,
  "strugglesCount": 8,
  "successfulResolutions": 3,
  "lastEncountered": "2025-01-15T10:30:00Z",
  "improvementTrend": "stable"
}
```

## Data Models

### Core Data Structures

```typescript
// User Session Model
interface CodingSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  fileType: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  totalLines: number;
  strugglesDetected: StruggleEvent[];
  interventionsTriggered: Intervention[];
  conceptsEncountered: string[];
  skillLevelAtStart: SkillLevel;
}

// Struggle Detection Model
interface StruggleEvent {
  eventId: string;
  timestamp: Date;
  type: StruggleType;
  severity: 'low' | 'medium' | 'high';
  codeContext: CodeContext;
  resolved: boolean;
  resolutionTime?: number; // seconds
}

// AI Teaching Model
interface TeachingIntervention {
  interventionId: string;
  sessionId: string;
  triggerEvent: StruggleEvent;
  question: string;
  hintsProvided: string[];
  studentResponses: string[];
  culturalReferences: string[];
  successful: boolean;
  completionTime: number;
}

// Progress Tracking Model
interface ConceptMastery {
  userId: string;
  conceptName: string;
  proficiencyScore: number; // 0.0 to 1.0
  strugglesCount: number;
  successfulResolutions: number;
  averageResolutionTime: number;
  lastEncountered: Date;
  improvementTrend: 'improving' | 'stable' | 'declining';
}
```

### Analytics Data Model

```typescript
interface SessionAnalytics {
  sessionId: string;
  timeline: TimelineEvent[];
  struggleHeatmap: HeatmapData[];
  conceptDifficulty: ConceptDifficultyMap;
  performanceMetrics: {
    totalCodingTime: number;
    activeEditingTime: number;
    struggleTime: number;
    interventionTime: number;
    debugTime: number;
  };
}

interface TimelineEvent {
  timestamp: Date;
  type: 'code_edit' | 'struggle_start' | 'intervention' | 'resolution';
  intensity: number; // 1-10 scale
  conceptInvolved?: string;
  lineNumber?: number;
}
```

Now I need to use the prework tool to analyze the acceptance criteria before writing the Correctness Properties section:

<function_calls>
<invoke name="prework">
<parameter name="featureName">devmitra

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties could be consolidated to eliminate redundancy:

- **Performance properties**: Multiple 2-second response time requirements can be combined into comprehensive performance properties
- **Data handling properties**: Privacy and security requirements share common patterns around data protection
- **UI interaction properties**: Several properties about VS Code integration and dashboard display can be streamlined
- **AI behavior properties**: Teaching and intervention properties share common validation patterns

The following properties represent the essential, non-redundant correctness guarantees for DevMitra:

### Core Correctness Properties

**Property 1: Struggle Pattern Detection Accuracy**
*For any* coding session with editing patterns, when a line is edited 5 or more times within 2 minutes OR when coding pauses for 30+ seconds OR when copy-paste operations occur, the system should detect and flag these as struggle patterns within 2 seconds
**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

**Property 2: Intervention Prioritization**
*For any* set of multiple struggle patterns occurring within a 5-minute window, the system should always prioritize the most recent pattern for intervention
**Validates: Requirements 1.4**

**Property 3: Socratic Teaching Constraint**
*For any* AI-generated intervention response, the content should never contain complete code solutions or direct implementations, while still providing contextual teaching questions
**Validates: Requirements 2.1, 2.2**

**Property 4: Adaptive Teaching Progression**
*For any* student interaction sequence, when a student remains stuck after 3 teaching exchanges, the system should provide progressively more specific hints while maintaining Socratic questioning approach
**Validates: Requirements 2.3, 2.6**

**Property 5: Cultural and Linguistic Adaptation**
*For any* teaching intervention generated for Indian students, the response should include Hinglish language elements and culturally relevant examples (chai shops, cricket, Indian context)
**Validates: Requirements 2.5, 2.7**

**Property 6: Skill Level Adaptation**
*For any* student with a defined skill level (beginner/intermediate), generated teaching questions should adapt in complexity appropriately to that skill level
**Validates: Requirements 2.4**

**Property 7: Real-time Analytics Generation**
*For any* active coding session, the system should generate real-time timeline visualizations with struggle moments highlighted and time tracking for each concept
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 8: Session Completion Analytics**
*For any* completed coding session, the system should generate a visual heatmap showing struggle intensity across time periods and identify concepts that caused difficulty
**Validates: Requirements 3.5**

**Property 9: Progress Tracking Persistence**
*For any* student across multiple sessions and devices, concept mastery levels and proficiency scores should be consistently tracked and updated when understanding is demonstrated
**Validates: Requirements 4.1, 4.2, 4.7**

**Property 10: Weakness Identification and Recommendations**
*For any* student with historical session data, the system should identify persistent weak areas and generate personalized learning path recommendations based on struggle patterns
**Validates: Requirements 4.3, 4.5**

**Property 11: Progress Visualization**
*For any* student accessing their progress, the system should display quantified proficiency levels and improvement trends over time for each tracked concept
**Validates: Requirements 4.4, 4.6**

**Property 12: VS Code Integration Functionality**
*For any* VS Code installation with the DevMitra extension, the system should monitor JavaScript/React files in real-time and display interventions in sidebar panels while maintaining minimal performance impact
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**

**Property 13: AI Context Comprehension**
*For any* code analysis request, the system should comprehend code intent beyond syntax checking, identify logical errors, and consider full context including learning history when generating interventions
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

**Property 14: Performance Response Times**
*For any* intervention generation or processing request, the system should maintain response times under 2 seconds
**Validates: Requirements 6.6, 8.2**

**Property 15: Data Privacy Protection**
*For any* code analysis operation, the system should analyze code in real-time without permanently storing complete source code, use encrypted connections, and anonymize any stored session data
**Validates: Requirements 7.1, 7.2, 7.4**

**Property 16: User Consent and Transparency**
*For any* new user, the system should require explicit consent before data collection and provide clear transparency about AI limitations and data usage
**Validates: Requirements 7.3, 7.5**

**Property 17: Opt-out Functionality**
*For any* user choosing to opt-out of data collection, core functionality should remain operational while respecting privacy preferences
**Validates: Requirements 7.6**

**Property 18: System Scalability and Resilience**
*For any* system load up to 100 concurrent users, the system should maintain performance through caching and gracefully degrade functionality under high load rather than failing completely
**Validates: Requirements 8.1, 8.3, 8.4**

**Property 19: Connectivity Graceful Degradation**
*For any* scenario where internet connectivity is lost, AI-powered features should fail gracefully while maintaining offline functionality where possible
**Validates: Requirements 8.6**

## Error Handling

### VS Code Extension Error Handling
- **Connection Failures**: Graceful degradation when backend is unavailable, with local caching of struggle patterns
- **Performance Issues**: Automatic throttling of monitoring frequency if VS Code performance degrades
- **File Type Errors**: Silent handling of unsupported file types with user notification
- **Authentication Errors**: Clear error messages with retry mechanisms

### Backend Error Handling
- **Bedrock API Failures**: Fallback to cached responses for common scenarios, with degraded functionality notifications
- **DynamoDB Throttling**: Exponential backoff retry logic with circuit breaker patterns
- **Lambda Timeout**: Asynchronous processing for long-running operations with status updates
- **API Gateway Limits**: Rate limiting with queuing for burst traffic

### AI Model Error Handling
- **Context Length Limits**: Automatic context truncation with preservation of most relevant information
- **Model Unavailability**: Fallback to rule-based interventions with reduced functionality
- **Response Quality Issues**: Content filtering and validation before delivery to students
- **Language Processing Errors**: Graceful fallback to English when Hinglish processing fails

### Data Consistency Error Handling
- **Session State Conflicts**: Last-write-wins with conflict resolution logging
- **Progress Tracking Errors**: Eventual consistency with manual reconciliation capabilities
- **Cache Invalidation**: Automatic cache refresh with stale data tolerance
- **Cross-Device Sync Issues**: Conflict resolution with user notification and choice

## Testing Strategy

### Dual Testing Approach

DevMitra will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of struggle pattern detection
- Edge cases in AI response generation
- Integration points between VS Code extension and backend
- Error conditions and fallback behaviors
- UI component rendering and interaction

**Property-Based Tests** focus on:
- Universal properties that hold across all inputs
- Comprehensive input coverage through randomization
- Performance characteristics under various loads
- Data consistency across different scenarios
- AI behavior validation across diverse code contexts

### Property-Based Testing Configuration

- **Testing Framework**: Hypothesis (Python) for backend Lambda functions, fast-check (TypeScript) for VS Code extension
- **Test Iterations**: Minimum 100 iterations per property test to ensure statistical confidence
- **Test Tagging**: Each property test tagged with format: **Feature: devmitra, Property {number}: {property_text}**
- **Coverage Requirements**: Each correctness property must be implemented by exactly one property-based test

### Testing Implementation Strategy

**Backend Testing**:
- Lambda functions tested with Hypothesis for property-based validation
- DynamoDB operations tested with various data patterns
- Bedrock integration tested with mock responses and real API calls
- Performance testing with load simulation up to 100 concurrent users

**Frontend Testing**:
- VS Code extension tested with fast-check for UI interactions
- WebSocket communication tested with various message patterns
- React dashboard tested with diverse analytics data sets
- Cross-browser compatibility testing for dashboard functionality

**Integration Testing**:
- End-to-end user journeys from struggle detection to intervention delivery
- Multi-session progress tracking across different devices
- Real-time communication between all system components
- Data consistency validation across the entire system

**Performance Testing**:
- Response time validation for all 2-second requirements
- Concurrent user load testing up to beta capacity
- Memory usage monitoring for VS Code extension
- Cache effectiveness measurement for common scenarios

### Test Data Strategy

- **Synthetic Code Generation**: Automated generation of JavaScript/React code samples with various complexity levels
- **Struggle Pattern Simulation**: Programmatic creation of editing patterns, pauses, and copy-paste behaviors
- **Cultural Context Validation**: Test data including Indian names, contexts, and Hinglish phrases
- **Progress Data Simulation**: Multi-session learning journeys with realistic concept mastery progression

This comprehensive testing strategy ensures that DevMitra meets all functional requirements while maintaining the performance and reliability standards necessary for effective real-time learning support.

## AI Prompt Engineering Approach

### Context-Aware Prompting Strategy

DevMitra uses a sophisticated prompt engineering approach to generate effective Socratic teaching interventions:

#### Base Prompt Template
```
You are DevMitra, an AI coding mentor for Indian computer science students. Your role is to guide students through Socratic questioning, never providing direct solutions.

Context:
- Student Skill Level: {skill_level}
- Programming Language: JavaScript/React
- Code Context: {code_snippet}
- Struggle Pattern: {struggle_type}
- Previous Interactions: {interaction_history}

Cultural Guidelines:
- Use Hinglish (Hindi-English code-switching) naturally
- Include Indian cultural references (chai, cricket, local examples)
- Be encouraging and supportive, not condescending

Teaching Approach:
- Ask guiding questions, never give direct answers
- Build on student's existing knowledge
- Use progressive hints if student remains stuck
- Encourage independent thinking

Current Situation:
{struggle_description}

Generate a teaching intervention that helps the student discover the solution through guided questioning.
```

#### Prompt Caching Strategy
- **Cache Key Structure**: `{skill_level}_{concept}_{struggle_type}`
- **Cache Duration**: 5 minutes (Amazon Bedrock default)
- **Cache Hit Rate Target**: 70% for common scenarios
- **Fallback Strategy**: Dynamic prompt generation for cache misses

#### Adaptive Prompting Based on Context
```python
def generate_intervention_prompt(context):
    base_prompt = get_base_template()
    
    # Skill level adaptation
    if context.skill_level == "beginner":
        base_prompt += "\nUse simple terminology and basic concepts."
    else:
        base_prompt += "\nYou can use intermediate programming concepts."
    
    # Struggle type specific guidance
    if context.struggle_type == "repeated_edit":
        base_prompt += "\nFocus on helping them understand the logic error."
    elif context.struggle_type == "long_pause":
        base_prompt += "\nHelp them break down the problem into smaller steps."
    elif context.struggle_type == "copy_paste":
        base_prompt += "\nGuide them to understand what the code actually does."
    
    # Cultural context injection
    base_prompt += f"\nCultural context: {get_cultural_examples(context.concept)}"
    
    return base_prompt
```

### Response Quality Assurance

#### Content Validation Pipeline
1. **Solution Detection**: Regex and NLP checks to ensure no direct code solutions
2. **Cultural Appropriateness**: Validation of Hinglish usage and cultural references
3. **Socratic Method Compliance**: Verification that response contains questions, not statements
4. **Length Optimization**: Ensure responses are concise but comprehensive

#### Response Enhancement
- **Emoji Integration**: Appropriate use of emojis for engagement (🤔, 💪, 🎯)
- **Code Highlighting**: Syntax highlighting for code references in questions
- **Progressive Disclosure**: Structured hint revelation based on student progress

## API Specifications

### REST API Endpoints

#### Session Management
```
POST /api/v1/sessions
- Create new coding session
- Request: { userId, fileType, skillLevel }
- Response: { sessionId, status, websocketUrl }

GET /api/v1/sessions/{sessionId}
- Retrieve session details
- Response: { session, struggles, interventions }

PUT /api/v1/sessions/{sessionId}/end
- End coding session
- Request: { endTime, summary }
- Response: { analytics, recommendations }
```

#### Struggle Detection
```
POST /api/v1/struggles
- Report struggle pattern
- Request: { sessionId, struggleType, codeContext, timestamp }
- Response: { interventionId, priority, estimatedResponseTime }

GET /api/v1/struggles/{sessionId}
- Retrieve session struggles
- Response: { struggles[], timeline, heatmap }
```

#### Analytics and Progress
```
GET /api/v1/analytics/{userId}
- Retrieve user analytics
- Query params: timeRange, concepts
- Response: { sessions, progress, trends, recommendations }

GET /api/v1/progress/{userId}
- Retrieve progress tracking
- Response: { conceptMastery, weakAreas, improvementTrends }
```

### WebSocket API Events

#### Client to Server Events
```javascript
// Connection establishment
{
  "action": "connect",
  "sessionId": "sess_abc123",
  "userId": "user123"
}

// Struggle pattern reporting
{
  "action": "struggle_detected",
  "sessionId": "sess_abc123",
  "struggleType": "repeated_edit",
  "codeContext": "fetch('api.com')",
  "lineNumber": 42,
  "timestamp": 1642248000
}

// Student response to intervention
{
  "action": "student_response",
  "interventionId": "int_xyz789",
  "response": "load pe?",
  "timestamp": 1642248030
}
```

#### Server to Client Events
```javascript
// Teaching intervention delivery
{
  "event": "intervention",
  "interventionId": "int_xyz789",
  "question": "Fetch kab chalega - component load pe ya baad mein? 🤔",
  "hints": ["Think about when the component renders", "API calls are asynchronous"],
  "culturalContext": "Jaise chai banane mein time lagta hai...",
  "timestamp": 1642248015
}

// Real-time analytics update
{
  "event": "analytics_update",
  "sessionId": "sess_abc123",
  "timeline": [...],
  "currentStruggle": "async/await",
  "timestamp": 1642248045
}

// Progress notification
{
  "event": "progress_update",
  "concept": "useEffect",
  "oldProficiency": 0.3,
  "newProficiency": 0.5,
  "improvement": "good",
  "timestamp": 1642248060
}
```

## Technology Stack Justification

### Frontend Technologies

**VS Code Extension (TypeScript)**
- **Rationale**: Native integration with VS Code APIs for real-time monitoring
- **Benefits**: Direct access to editor events, minimal performance overhead
- **Alternatives Considered**: Language Server Protocol (too complex for monitoring needs)

**React Dashboard**
- **Rationale**: Component-based architecture ideal for analytics visualization
- **Benefits**: Rich ecosystem for charting (Recharts), responsive design capabilities
- **Alternatives Considered**: Vue.js (smaller ecosystem), Angular (too heavy for dashboard needs)

### Backend Technologies

**AWS Lambda (Python 3.11)**
- **Rationale**: Serverless architecture matches usage patterns, automatic scaling
- **Benefits**: Pay-per-use pricing, built-in high availability, easy integration with AWS services
- **Alternatives Considered**: EC2 (over-provisioning for variable load), ECS (unnecessary complexity)

**Amazon Bedrock (Claude 3.5 Sonnet)**
- **Rationale**: State-of-the-art language model with strong reasoning capabilities
- **Benefits**: Managed service, prompt caching, cultural context understanding
- **Alternatives Considered**: OpenAI GPT-4 (higher latency), Self-hosted models (operational overhead)

**DynamoDB**
- **Rationale**: NoSQL flexibility for varied session data, automatic scaling
- **Benefits**: Single-digit millisecond latency, built-in security, global tables capability
- **Alternatives Considered**: RDS (rigid schema), MongoDB (operational complexity)

**API Gateway**
- **Rationale**: Managed API service with WebSocket support for real-time features
- **Benefits**: Built-in throttling, caching, monitoring, seamless Lambda integration
- **Alternatives Considered**: ALB (lacks WebSocket features), Direct Lambda URLs (no throttling)

### Infrastructure Technologies

**S3 + CloudFront**
- **Rationale**: Global content delivery for dashboard with edge caching
- **Benefits**: Low latency worldwide, automatic scaling, cost-effective storage
- **Alternatives Considered**: EC2 hosting (higher operational overhead), Vercel (vendor lock-in)

## Deployment Architecture

### Multi-Environment Strategy

#### Development Environment
- **Lambda Functions**: Individual function deployment for rapid iteration
- **DynamoDB**: On-demand billing for cost optimization during development
- **Bedrock**: Shared model access with development-specific prompts
- **Frontend**: Local development servers with hot reload

#### Staging Environment
- **Infrastructure**: Identical to production but with reduced capacity
- **Data**: Synthetic test data with realistic usage patterns
- **Monitoring**: Full observability stack for pre-production validation
- **Testing**: Automated integration and performance testing

#### Production Environment
- **Lambda Functions**: Provisioned concurrency for consistent performance
- **DynamoDB**: Auto-scaling with predictive scaling enabled
- **CloudFront**: Global edge locations with custom caching policies
- **Monitoring**: Real-time alerting and automated incident response

### Infrastructure as Code

```yaml
# CloudFormation template structure
Resources:
  # API Gateway with WebSocket support
  DevMitraAPI:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: devmitra-api
      ProtocolType: WEBSOCKET
      RouteSelectionExpression: $request.body.action

  # Lambda functions with appropriate memory and timeout
  StruggleDetectorFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.11
      MemorySize: 512
      Timeout: 30
      ReservedConcurrencyLimit: 50

  # DynamoDB tables with GSI for efficient queries
  SessionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: ON_DEMAND
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      GlobalSecondaryIndexes:
        - IndexName: UserIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
```

### Deployment Pipeline

#### CI/CD Workflow
1. **Code Commit**: Trigger on main branch push
2. **Build Phase**: TypeScript compilation, Python packaging
3. **Test Phase**: Unit tests, integration tests, security scans
4. **Deploy Staging**: Automated deployment to staging environment
5. **Integration Testing**: End-to-end testing in staging
6. **Production Deployment**: Blue-green deployment with rollback capability
7. **Post-Deployment**: Health checks and performance validation

#### Rollback Strategy
- **Lambda Functions**: Automatic rollback on error rate threshold
- **Frontend**: CloudFront invalidation with previous version restoration
- **Database**: Point-in-time recovery with minimal data loss
- **Configuration**: Parameter Store versioning for quick reversion

### Monitoring and Observability

#### Application Metrics
- **Response Times**: P50, P95, P99 latencies for all API endpoints
- **Error Rates**: 4xx and 5xx error tracking with alerting
- **User Engagement**: Session duration, intervention success rates
- **AI Performance**: Bedrock response times, cache hit rates

#### Infrastructure Metrics
- **Lambda Performance**: Duration, memory usage, cold starts
- **DynamoDB Performance**: Read/write capacity utilization, throttling
- **API Gateway**: Request count, integration latency, WebSocket connections
- **CloudFront**: Cache hit ratio, origin response times

#### Alerting Strategy
- **Critical Alerts**: System downtime, high error rates (>5%)
- **Warning Alerts**: Performance degradation, capacity thresholds
- **Info Alerts**: Deployment notifications, scheduled maintenance
- **Escalation**: PagerDuty integration for critical issues

This comprehensive design provides a robust foundation for DevMitra's real-time AI-powered learning platform, ensuring scalability, reliability, and optimal user experience for Indian computer science students.