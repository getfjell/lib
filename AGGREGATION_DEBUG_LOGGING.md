# AggregationBuilder Debug Logging Guide

## Overview

Comprehensive debug logging has been added to `lib/src/processing/AggregationBuilder.ts` to help diagnose location key array construction issues.

## Log Messages

The AggregationBuilder now emits detailed `logger.info()` messages at each step with the 🔍 emoji prefix for easy filtering.

### 1. START - Initial State

```
🔍 AggregationBuilder START
```

**What it shows:**
- `itemKeyType`: The key type of the item being aggregated from (e.g., 'orderForm')
- `itemKeyPk`: The primary key value of the item
- `itemKeyFull`: Complete JSON representation of the item's key structure
- `targetKta`: The target coordinate being aggregated (e.g., ['orderNoseShape', 'orderForm', 'order'])
- `aggregationProperty`: The property name being populated
- `cardinality`: Whether it's 'one' or 'many'

**Example:**
```json
{
  "itemKeyType": "orderForm",
  "itemKeyPk": "form-123",
  "itemKeyFull": "{\"kt\":\"orderForm\",\"pk\":\"form-123\",\"loc\":[{\"kt\":\"order\",\"lk\":\"order-456\"}]}",
  "targetKta": ["orderNoseShape", "orderForm", "order"],
  "aggregationProperty": "noseShape",
  "cardinality": "one"
}
```

### 2. DETECTION - Aggregation Type Detection

```
🔍 AggregationBuilder DETECTION
```

**What it shows:**
- `currentItemType`: The key type of the current item
- `targetKta`: The target coordinate array
- `targetKtaSliced`: The target coordinate array minus the first element (shows hierarchy)
- `includesCurrentItem`: Boolean - does the target hierarchy include current item?
- `isChildAggregation`: Boolean - final determination of aggregation type
- `isComKeyResult`: Boolean - is the item key a ComKey or PriKey?

**What to look for:**
- **For OrderForm → OrderNoseShape (should be CHILD aggregation):**
  - `currentItemType`: "orderForm"
  - `targetKta`: ["orderNoseShape", "orderForm", "order"]
  - `targetKtaSliced`: ["orderForm", "order"]
  - `includesCurrentItem`: **true** (orderForm IS in the hierarchy)
  - `isChildAggregation`: **true**
  - `isComKeyResult`: **true** (OrderForm is a ComKey)

**Example:**
```json
{
  "currentItemType": "orderForm",
  "targetKta": ["orderNoseShape", "orderForm", "order"],
  "targetKtaSliced": ["orderForm", "order"],
  "includesCurrentItem": true,
  "isChildAggregation": true,
  "isComKeyResult": true
}
```

### 3. COMKEY - ComKey Details (only if ComKey)

```
🔍 AggregationBuilder COMKEY
```

**What it shows:**
- `comKeyKt`: The key type
- `comKeyPk`: The primary key value
- `comKeyLoc`: JSON representation of the location array
- `comKeyLocLength`: Number of parent locations

**What to look for:**
- Does `comKeyLoc` contain the expected parent locations?
- For OrderForm, should show: `[{"kt":"order","lk":"order-456"}]`

**Example:**
```json
{
  "comKeyKt": "orderForm",
  "comKeyPk": "form-123",
  "comKeyLoc": "[{\"kt\":\"order\",\"lk\":\"order-456\"}]",
  "comKeyLocLength": 1
}
```

### 4. CHILD AGGREGATION / SIBLING AGGREGATION / PRIMARY KEY

One of these three will be logged depending on the aggregation type:

#### Child Aggregation
```
🔍 AggregationBuilder CHILD AGGREGATION
```

**What it shows:**
- `currentItemLocKey`: The current item converted to a location key
- `parentLocs`: The parent locations from the item's key
- `constructedLocation`: The final location array (current item + parents)
- `locationLength`: Number of location keys

**What to look for:**
- `constructedLocation` should contain BOTH the current item AND its parents
- For OrderForm → OrderNoseShape: should be `[{kt:'orderForm',lk:'form-123'}, {kt:'order',lk:'order-456'}]`

**Example:**
```json
{
  "currentItemLocKey": {"kt": "orderForm", "lk": "form-123"},
  "parentLocs": "[{\"kt\":\"order\",\"lk\":\"order-456\"}]",
  "constructedLocation": "[{\"kt\":\"orderForm\",\"lk\":\"form-123\"},{\"kt\":\"order\",\"lk\":\"order-456\"}]",
  "locationLength": 2
}
```

#### Sibling Aggregation
```
🔍 AggregationBuilder SIBLING AGGREGATION
```

**What it shows:**
- `ikToLKAResult`: The location array from ikToLKA (parent locations only)
- `locationLength`: Number of location keys

**What to look for:**
- Should NOT include the current item
- For User → Profile in Org: should be `[{kt:'org',lk:'org1'}]`

#### Primary Key
```
🔍 AggregationBuilder PRIMARY KEY
```

**What it shows:**
- `ikToLKAResult`: The location array (item converted to location)
- `locationLength`: Should be 1

### 5. FINAL LOCATION - Before Operation Call

```
🔍 AggregationBuilder FINAL LOCATION
```

**What it shows:**
- `finalLocation`: The complete location array being passed to operations
- `finalLocationLength`: Number of location keys
- `operationType`: 'one' or 'many'
- `targetLibraryKta`: The coordinate of the target library

**What to look for:**
- This is the **actual array being passed** to `operations.one()` or `operations.all()`
- Compare this to what the target library expects
- For OrderForm → OrderNoseShape: should be `[{kt:'orderForm',lk:'form-123'}, {kt:'order',lk:'order-456'}]`

**Example:**
```json
{
  "finalLocation": "[{\"kt\":\"orderForm\",\"lk\":\"form-123\"},{\"kt\":\"order\",\"lk\":\"order-456\"}]",
  "finalLocationLength": 2,
  "operationType": "one",
  "targetLibraryKta": ["orderNoseShape", "orderForm", "order"]
}
```

## How to Use This Logging

### 1. Enable Info Level Logging

Make sure your logger is set to show `info` level messages:

```typescript
// In your application
import { setLogLevel } from '@fjell/lib';
setLogLevel('info'); // or 'debug'
```

### 2. Filter for Aggregation Logs

All aggregation debug logs start with 🔍, so you can filter:

```bash
# In your application logs
grep "🔍 AggregationBuilder" logs.txt
```

### 3. Trace a Specific Aggregation

Follow the log sequence for a single aggregation:
1. **START** - See what's being aggregated
2. **DETECTION** - See if it's being classified correctly
3. **COMKEY/PRIMARY** - See the key structure
4. **CHILD/SIBLING** - See how location is constructed
5. **FINAL LOCATION** - See what's actually being passed

### 4. Diagnose the OrderForm → OrderNoseShape Issue

Look for these specific values:

**Expected for CORRECT behavior:**
```
START: itemKeyType="orderForm", targetKta=["orderNoseShape","orderForm","order"]
DETECTION: isChildAggregation=true, isComKeyResult=true
COMKEY: comKeyLoc="[{\"kt\":\"order\",\"lk\":\"...\"}]"
CHILD AGGREGATION: locationLength=2
FINAL LOCATION: finalLocation="[{\"kt\":\"orderForm\",...},{\"kt\":\"order\",...}]"
```

**If you see WRONG behavior:**
```
DETECTION: isChildAggregation=false  ❌ (should be true)
SIBLING AGGREGATION logged  ❌ (should be CHILD)
FINAL LOCATION: locationLength=1  ❌ (should be 2)
```

## Common Issues to Look For

### Issue 1: Wrong Aggregation Type Detected
**Symptom:** `isChildAggregation=false` when it should be true

**Causes:**
- Target KTA doesn't include current item type in hierarchy
- Current item type name mismatch

### Issue 2: Missing Parent Locations
**Symptom:** `comKeyLocLength=0` or empty `comKeyLoc`

**Causes:**
- Item key is actually a PriKey not a ComKey
- Item key structure is malformed

### Issue 3: Wrong Location Array Length
**Symptom:** `finalLocationLength` doesn't match expected

**Causes:**
- Sibling aggregation detected instead of child
- Parent locations not being included
- ikToLKA returning unexpected result

## Next Steps

Once you have the logs:

1. **Share the complete log sequence** from START to FINAL LOCATION
2. **Compare against expected values** in this guide
3. **Identify which step** shows unexpected behavior
4. **Focus debugging** on that specific step

The logs will definitively show:
- Whether the item key structure is correct
- Whether the detection logic is working
- Whether the location construction is correct
- What's actually being passed to the operations

