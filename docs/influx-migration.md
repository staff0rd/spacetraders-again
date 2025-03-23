# InfluxDB to PostgreSQL Migration Guide

This document outlines the steps to migrate time-series data storage from InfluxDB to PostgreSQL in the SpaceTraders project.

## Overview

Currently, the project uses InfluxDB to store time-series data in these files:
- `/src/features/status/get-status.ts`
- `/src/features/status/actions/getActor.ts`
- `/src/features/waypoints/getWaypoints.ts`

These files use the functions defined in `/src/features/status/influxWrite.ts`.

The migration strategy is to replace InfluxDB with PostgreSQL (which is already used in the project) by creating a single flexible entity to store time-series data instead of multiple specialized entities.

## Prerequisites

- Working knowledge of MikroORM and PostgreSQL
- Understanding of the SpaceTraders codebase
- Existing PostgreSQL database connection configured in the project

## Implementation Steps

### 1. Create a TimeSeriesData Entity

Create a single entity that can store any type of time-series data with the following key properties:
- Primary key
- Timestamp field
- Reset date field
- Agent symbol field
- Measurement name field (to identify the type of measurement)
- Tags as a JSONB column (for string metadata)
- Fields as a JSONB column (for numeric/string values)

Add appropriate indexes for performance:
- Index on timestamp
- Index on measurement name
- Composite index on agent symbol, reset date, and measurement name
- GIN indexes on JSONB columns for efficient querying

### 2. Create a PostgreSQL Write Service

Create a `postgresWrite.ts` file to replace `influxWrite.ts` with equivalent functions:

1. Core function to write a time-series data point to PostgreSQL
2. Implementation of all existing functions from `influxWrite.ts`:
   - `writePoint`
   - `writeMyMarketTransaction`
   - `writeCredits`
   - `writeExtraction`
   - `writeShipyardTransaction`
   - `writeMarketTransaction`
   - `writeMarketTradeGood`
   - `writeContract`
3. Additional functions for stats and leaderboard data currently written directly in `get-status.ts`

Ensure these functions have the same signatures as the existing InfluxDB functions to minimize changes to calling code.

### 3. Create Database Migration

Generate a migration for the new `time_series_data` table with appropriate columns and indexes.

### 4. Update References in Existing Files

1. In `/src/features/status/get-status.ts`:
   - Replace direct uses of InfluxDB's `Point` class with calls to your new PostgreSQL functions

2. In `/src/features/status/actions/getActor.ts`:
   - Replace imports from `influxWrite.ts` with imports from your new `postgresWrite.ts`
   - No function signature changes should be needed

3. In `/src/features/waypoints/getWaypoints.ts`:
   - Replace imports and function calls similarly

### 5. Create Query Functions (Optional)

Create a `postgresQuery.ts` file with functions to retrieve time-series data for reporting or visualization needs.

### 6. Test the Migration

Thoroughly test the new implementation to ensure data is being properly stored and retrieved.

### 7. Remove InfluxDB Dependency

Once everything is working correctly:
1. Remove the InfluxDB client package dependency
2. Remove the `influxWrite.ts` file
3. Update configuration to remove InfluxDB settings

A code cleanup pass should be done to remove any remaining imports of InfluxDB types (like `Point`) from the codebase.

## Performance Considerations

- Consider batching writes for better performance when multiple data points are written in sequence
- Monitor query performance and adjust indexes as needed
- Implement data retention policies if storing large volumes of time-series data

## Example Schema

The `time_series_data` table should have this structure:
```
id: SERIAL PRIMARY KEY
timestamp: TIMESTAMP NOT NULL
reset_date: VARCHAR(255) NOT NULL
agent_symbol: VARCHAR(255) NOT NULL
measurement_name: VARCHAR(255) NOT NULL
tags: JSONB NOT NULL DEFAULT '{}'
fields: JSONB NOT NULL DEFAULT '{}'
```

With appropriate indexes as mentioned above.

## Migration Strategy

This approach maintains the existing API while changing the underlying storage mechanism. The functions in `postgresWrite.ts` should match the signatures of those in `influxWrite.ts` to minimize changes in the calling code.

By using a single flexible entity with JSONB columns, we maintain the flexibility of InfluxDB's schema-less design while leveraging PostgreSQL's transaction support and the existing MikroORM setup.
