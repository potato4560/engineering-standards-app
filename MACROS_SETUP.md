# Macros Database Setup Guide

## 📋 Supabase Table Creation

To enable the Macros functionality, you need to create a `macros` table in your Supabase database.

### Step 1: Create the Macros Table

Go to your Supabase SQL Editor and run:

```sql
CREATE TABLE macros (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'documented',
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: Set Up Row Level Security

```sql
-- Enable RLS
ALTER TABLE macros ENABLE ROW LEVEL SECURITY;

-- Create policy for full public access
CREATE POLICY "Enable all operations for authenticated and anonymous users" 
ON macros 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Step 3: Populate with Initial Data

```sql
INSERT INTO macros (name, file_name, description, status) VALUES
('Attribute Label', 'Attribute_Label.4do', 'This macro allows the user to select a string or vertex and then pick from a list an attribute they want to label as a leader. Useful for quickly creating labels from existing attribute data without manually typing values.', 'documented'),
('Attribute Mapper - TfNSW Asset', 'Attribute_Mapper_TfNSW_Asset.4do', 'Allows the user to insert the entire attribute hierarchy list values for asset data according to Transport for NSW standards within the BIM schema. Ensures asset attributes comply with TfNSW requirements.', 'documented'),
('Attribute Mapper - TfNSW Locality', 'Attribute_Mapper_TfNSW_Locality.4do', 'Allows the user to insert the entire attribute hierarchy list values for locality data according to Transport for NSW standards within the BIM schema. Ensures locality attributes comply with TfNSW requirements.', 'documented'),
('Custom Info Panel', 'CustomInfoPanel.4do', '⚠️ Not currently working - refrain from using at this time. Custom panel functionality under development.', 'pending'),
('Duplicate Remover', 'Duplicate_Remover.4do', 'Simply deletes any points or strings that have the same XYZ value. Useful for cleaning up survey data and removing redundant geometry.', 'documented'),
('Element Search Panel', 'Element_Search_Panel.4do', 'Allows the user to insert an element ID to then be pinned to the element in question. Useful for quickly locating specific elements in large models.', 'documented'),
('Global Extend Trim', 'global_extend_trim.4do', 'Allows dynamic trimming and extending of various points and strings. Use with caution - can make widespread changes to geometry.', 'documented'),
('Label Segment Grade', 'Label_Segment_grade.4do', 'Simply labels the percent fall on a string. Quickly annotates grade information for review and documentation.', 'documented'),
('Move Duplicate Points to Models', 'Move_duplicate_points_toModels.4do', 'Moves duplicate points to separate models. Somewhat useful for organizing and isolating duplicate geometry for review or cleanup.', 'documented'),
('Splice Strings Panel', 'Splice_Strings_Panel.4do', 'Allows the user to insert a small pothole string into the bigger main string while retaining the vertex attributes of the potholed string. Useful for maintaining attribute data when integrating detailed features into larger strings.', 'documented'),
('Split by Attribute', 'Split_by_Attribute.4do', 'Uses different QLS (Query Language Strings) to split strings based on what''s on the vertex. Useful for breaking strings apart based on attribute changes.', 'documented'),
('Super Parallel', 'super_parallel.4do', 'Allows the offset and parallel of different strings in an MTF fashion but using a macro, so you cannot recalculate this. Creates static parallel strings.', 'documented'),
('Symbol Align', 'Symbol_Align.4do', 'Allows the user to align points to strings and also adjust symbol size and symbol type. Useful for placing and formatting symbols along alignment features.', 'documented'),
('Vertex Manager', 'Vertex_Manager.4do', 'Comprehensive tool for managing vertex attributes and properties on strings. Provides advanced control over vertex-level data.', 'documented');
```

## ✅ Table Schema

| Column Name | Data Type | Default | Required | Description |
|------------|-----------|---------|----------|-------------|
| id | int8 | auto-increment | ✅ | Primary key |
| name | text | - | ✅ | Macro display name |
| file_name | text | - | ✅ | .4do filename |
| description | text | - | ❌ | What the macro does |
| status | text | 'documented' | ❌ | 'documented' or 'pending' |
| video_url | text | - | ❌ | Link to tutorial video |
| created_at | timestamptz | now() | ❌ | Creation timestamp |

## 🎯 After Setup

Once you've run these SQL commands:

1. ✅ The macros table will be created
2. ✅ All 14 initial macros will be populated
3. ✅ Public access will be enabled
4. ✅ Your app will automatically load and display them

## 🔧 Managing Macros

After setup, you can:
- **Add new macros** via the admin interface
- **Edit descriptions** to add more details
- **Add video URLs** as you create tutorial videos
- **Change status** from 'documented' to 'pending' if issues arise
- **Delete outdated macros** that are no longer relevant

## 📱 Features Available

- ✅ Search functionality
- ✅ Status filtering
- ✅ Table of contents with jump links
- ✅ Full CRUD operations (admin only)
- ✅ Video tutorial links
- ✅ Same dark theme as Standards page

## 🚀 Next Steps

1. Run the SQL commands above in Supabase
2. Refresh your deployed app
3. Click the "Macros" tab in the header
4. Login as admin to add video URLs or edit descriptions
5. Share with your team!
