# GEMODIDA - Product Overview

## Project Purpose
GEMODIDA is a comprehensive web scraping and data management platform built with Next.js. It provides enterprise-grade capabilities for collecting, analyzing, and managing web data with role-based access control, real-time monitoring, and advanced reporting features.

## Key Features & Capabilities

### Core Functionality
- **Web Scraping Management**: Configure, execute, and monitor web scraping operations
- **Keyword Management**: Create and manage keyword lists for targeted data collection
- **Results Management**: Store, organize, and retrieve scraped data with advanced filtering
- **Survey System**: Create and manage surveys for data collection and analysis
- **Activity Tracking**: Monitor all system activities with comprehensive audit logs
- **Real-time Reporting**: Generate dynamic reports with charts and analytics

### User Management & Security
- **Role-Based Access Control (RBAC)**: Admin, Operator, Analyst, and Viewer roles
- **Authentication**: Supabase-based authentication with email/password and OAuth support
- **Authorization**: Row-level security (RLS) policies for data protection
- **User Management**: Create, update, and manage user accounts with role assignment
- **Activity Logging**: Track all user actions for compliance and auditing

### Admin Panel
- User management and role assignment
- System settings and configuration
- Activity logs and audit trails
- Role management and permissions
- System health monitoring

### Operations Panel
- Keyword management interface
- Results browsing and filtering
- Report generation and viewing
- Survey management
- Activity monitoring

## Target Users & Use Cases

### Primary Users
- **System Administrators**: Manage users, roles, and system configuration
- **Data Operators**: Execute scraping operations and manage keywords
- **Data Analysts**: Analyze results and generate reports
- **Viewers**: Read-only access to reports and data

### Use Cases
1. **Market Research**: Collect competitive intelligence and market data
2. **Price Monitoring**: Track pricing across multiple sources
3. **Content Aggregation**: Gather content from multiple websites
4. **Lead Generation**: Collect business contact information
5. **SEO Monitoring**: Track search rankings and competitor activity
6. **Data Analysis**: Analyze trends and patterns in collected data

## Technical Architecture
- **Frontend**: Next.js 16 with React 19, TypeScript
- **Backend**: Next.js API routes with Supabase
- **Database**: PostgreSQL via Supabase
- **UI Framework**: Tailwind CSS with Radix UI components
- **State Management**: React hooks with custom hooks
- **Authentication**: Supabase Auth with SSR support
- **PWA Support**: Progressive Web App capabilities

## Data Model
- **Users**: User accounts with roles and permissions
- **Roles**: RBAC with granular permissions
- **Keywords**: Search terms and configurations
- **Results**: Scraped data and metadata
- **Surveys**: Survey definitions and responses
- **Activities**: Audit logs and system events
- **Reports**: Generated analytics and insights
