-- ========================================================
-- Riverdale Water Treatment Plant — Demo Seed Data
-- 130 instruments, 4 areas, full calibration history
-- Generated for Calcheq demo account
-- ========================================================

BEGIN;

-- Clear existing Demo data
DELETE FROM cal_test_points WHERE calibration_record_id IN (
  SELECT cr.id FROM calibration_records cr
  JOIN instruments i ON cr.instrument_id = i.id
  WHERE i.created_by = 'Demo'
);
DELETE FROM calibration_records WHERE instrument_id IN (SELECT id FROM instruments WHERE created_by = 'Demo');
DELETE FROM audit_log WHERE site_id = '004c156b-5012-45d8-892d-4a34e159e6f9';
DELETE FROM instruments WHERE created_by = 'Demo';

-- ── Instruments ──────────────────────────────────────────
INSERT INTO instruments (
  tag_number, description, area, instrument_type,
  manufacturer, model, serial_number,
  measurement_lrv, measurement_urv, engineering_units,
  output_type, calibration_interval_days,
  tolerance_type, tolerance_value, num_test_points,
  criticality, status,
  last_calibration_date, last_calibration_result, calibration_due_date,
  created_by, created_at
) VALUES
  ('PT-101','Raw Water Inlet Pressure','Intake & Raw Water','pressure','Endress+Hauser','Cerabar M','ENPR-1001',0.0,600.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-05','pass','2026-09-01','Demo',NOW()),
  ('PT-102','Screen Inlet DP','Intake & Raw Water','pressure','Rosemount','3051','ROPR-1001',0.0,100.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-12-09','marginal','2026-12-09','Demo',NOW()),
  ('PT-103','Pump 1 Discharge Pressure','Intake & Raw Water','pressure','Yokogawa','EJA110E','YOPR-1001',0.0,1000.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-08-28','fail','2026-02-24','Demo',NOW()),
  ('PT-104','Pump 2 Discharge Pressure','Intake & Raw Water','pressure','Endress+Hauser','Cerabar M','ENPR-1002',0.0,1000.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-04-03','pass','2026-09-30','Demo',NOW()),
  ('PT-105','Pump 3 Discharge Pressure','Intake & Raw Water','pressure','Rosemount','3051','ROPR-1002',0.0,1000.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-07','pass','2026-09-03','Demo',NOW()),
  ('FT-101','Raw Water Intake Flow','Intake & Raw Water','flow','Yokogawa','ADMAG AXF','YOFL-1001',0.0,5000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'safety_critical','active','2025-08-08','pass','2026-02-04','Demo',NOW()),
  ('FT-102','Screen Bypass Flow','Intake & Raw Water','flow','Endress+Hauser','Promag 10W','ENFL-1001',0.0,2000.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-18','pass','2027-03-18','Demo',NOW()),
  ('FT-103','Pump 1 Flow','Intake & Raw Water','flow','Krohne','IFC 050','KRFL-1001',0.0,2000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-14','marginal','2026-08-13','Demo',NOW()),
  ('LT-101','Raw Water Sump Level','Intake & Raw Water','level','VEGA','VEGABAR 82','VELE-1001',0.0,5.0,'m','4-20mA',180,'percent_span',0.5,5,'safety_critical','active','2025-08-31','pass','2026-02-27','Demo',NOW()),
  ('LT-102','Screen Channel Level','Intake & Raw Water','level','Endress+Hauser','FMB50','ENLE-1001',0.0,3.0,'m','4-20mA',365,'percent_span',1.0,5,'process_critical','active','2026-03-20','pass','2027-03-20','Demo',NOW()),
  ('LT-103','Raw Water Storage Level','Intake & Raw Water','level','Rosemount','3300','ROLE-1001',0.0,10.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-11-14','marginal','2026-05-13','Demo',NOW()),
  ('TT-101','Raw Water Temperature','Intake & Raw Water','temperature','ABB','TSP341','ABTE-1001',0.0,40.0,'degC','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-12-11','marginal','2026-12-11','Demo',NOW()),
  ('AT-101','Raw Water Turbidity','Intake & Raw Water','analyser','Hach','SC1000','HAAN-1001',0.0,100.0,'NTU','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2025-11-06','fail','2026-02-04','Demo',NOW()),
  ('AT-102','Raw Water pH','Intake & Raw Water','analyser','YSI','Pro Plus','YSAN-1001',4.0,10.0,'pH','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2025-10-19','fail','2026-01-17','Demo',NOW()),
  ('AT-103','Raw Water Dissolved Oxygen','Intake & Raw Water','analyser','WTW','IQ SensorNet','WTAN-1001',0.0,20.0,'mg/L','4-20mA',180,'percent_span',2.0,5,'standard','active','2025-11-30','marginal','2026-05-29','Demo',NOW()),
  ('SV-101','Intake Isolating Valve Position','Intake & Raw Water','valve','Rotork','IQ3','ROVA-1001',0.0,100.0,'%','4-20mA',365,'percent_span',2.0,3,'process_critical','active','2026-01-11','marginal','2027-01-11','Demo',NOW()),
  ('SV-102','Screen Bypass Valve Position','Intake & Raw Water','valve','Auma','SARV','AUVA-1001',0.0,100.0,'%','4-20mA',365,'percent_span',2.0,3,'standard','active','2025-10-10','pass','2026-10-10','Demo',NOW()),
  ('FS-101','Pump 1 Flow Switch','Intake & Raw Water','switch','Gems Sensors','26700','GESW-1001',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-02-22','pass','2026-08-21','Demo',NOW()),
  ('FS-102','Pump 2 Flow Switch','Intake & Raw Water','switch','Endress+Hauser','FTW23','ENSW-1001',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-01-06','pass','2026-07-05','Demo',NOW()),
  ('PS-101','High Pressure Trip Switch','Intake & Raw Water','switch','WIKA','GS-02','WISW-1001',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-03-10','marginal','2026-09-06','Demo',NOW()),
  ('PS-102','Low Pressure Alarm Switch','Intake & Raw Water','switch','Gems Sensors','26700','GESW-1002',0.0,1.0,'Bool','4-20mA',365,'absolute',1,3,'process_critical','active','2026-02-12','pass','2027-02-12','Demo',NOW()),
  ('PT-106','Pump 3 Suction Pressure','Intake & Raw Water','pressure','Endress+Hauser','Cerabar M','ENPR-1003',0.0,200.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-10-08','pass','2026-10-08','Demo',NOW()),
  ('FT-104','Pump 2 Flow','Intake & Raw Water','flow','Krohne','IFC 050','KRFL-1002',0.0,2000.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-11','marginal','2027-03-11','Demo',NOW()),
  ('TT-102','Pump Motor Temperature 1','Intake & Raw Water','temperature','ABB','TSP341','ABTE-1002',0.0,120.0,'degC','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2026-03-21','pass','2026-09-17','Demo',NOW()),
  ('TT-103','Pump Motor Temperature 2','Intake & Raw Water','temperature','Endress+Hauser','TMT162','ENTE-1001',0.0,120.0,'degC','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-29','marginal','2027-01-29','Demo',NOW()),
  ('AT-104','Raw Water Conductivity','Intake & Raw Water','analyser','YSI','Pro Plus','YSAN-1002',0.0,2000.0,'uS/cm','4-20mA',180,'percent_span',2.0,5,'standard','active','2026-03-13','pass','2026-09-09','Demo',NOW()),
  ('LT-104','Coagulation Tank Level','Intake & Raw Water','level','VEGA','VEGABAR 82','VELE-1002',0.0,4.0,'m','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-05-21','pass','2026-05-21','Demo',NOW()),
  ('PT-107','Filter Feed Header Pressure','Intake & Raw Water','pressure','Endress+Hauser','Cerabar M','ENPR-1004',0.0,500.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-12','pass','2026-08-11','Demo',NOW()),
  ('FT-105','Coagulant Dosing Flow','Intake & Raw Water','flow','Krohne','IFC 050','KRFL-1003',0.0,100.0,'L/h','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2026-03-22','pass','2026-09-18','Demo',NOW()),
  ('FT-106','Flocculant Dosing Flow','Intake & Raw Water','flow','Yokogawa','ADMAG AXF','YOFL-1002',0.0,50.0,'L/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-11-05','pass','2026-11-05','Demo',NOW()),
  ('PT-201','Coagulation Basin Pressure','Treatment','pressure','Endress+Hauser','Cerabar M','ENPR-1005',0.0,200.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-12-04','pass','2026-12-04','Demo',NOW()),
  ('LT-201','Flocculation Tank 1 Level','Treatment','level','Rosemount','3300','ROLE-1002',0.0,5.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-08-21','fail','2026-02-17','Demo',NOW()),
  ('LT-202','Flocculation Tank 2 Level','Treatment','level','VEGA','VEGABAR 82','VELE-1003',0.0,5.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-12-30','pass','2026-06-28','Demo',NOW()),
  ('LT-203','Sedimentation Basin Level','Treatment','level','Endress+Hauser','FMB50','ENLE-1002',0.0,6.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-01-25','marginal','2026-07-24','Demo',NOW()),
  ('LT-204','Sludge Sump Level','Treatment','level','Rosemount','3300','ROLE-1003',0.0,3.0,'m','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-10-03','pass','2026-10-03','Demo',NOW()),
  ('FT-201','Settled Water Flow','Treatment','flow','Yokogawa','ADMAG AXF','YOFL-1003',0.0,5000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-01-24','pass','2026-07-23','Demo',NOW()),
  ('FT-202','Sludge Withdrawal Flow','Treatment','flow','Endress+Hauser','Promag 10W','ENFL-1002',0.0,200.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-05-26','pass','2026-05-26','Demo',NOW()),
  ('FT-203','Alum Dosing Flow','Treatment','flow','Krohne','IFC 050','KRFL-1004',0.0,500.0,'L/h','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2025-08-11','pass','2026-02-07','Demo',NOW()),
  ('FT-204','Lime Dosing Flow','Treatment','flow','Yokogawa','ADMAG AXF','YOFL-1004',0.0,200.0,'L/h','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2026-02-21','marginal','2026-08-20','Demo',NOW()),
  ('FT-205','Polymer Dosing Flow','Treatment','flow','Endress+Hauser','Promag 10W','ENFL-1003',0.0,50.0,'L/h','4-20mA',365,'percent_span',2.0,5,'standard','active','2025-08-09','marginal','2026-08-09','Demo',NOW()),
  ('TT-201','Settled Water Temperature','Treatment','temperature','Rosemount','644','ROTE-1001',0.0,40.0,'degC','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-02-07','marginal','2027-02-07','Demo',NOW()),
  ('TT-202','Sludge Temperature','Treatment','temperature','ABB','TSP341','ABTE-1003',0.0,40.0,'degC','4-20mA',730,'percent_span',2.0,5,'non_critical','active','2025-06-21','pass','2027-06-21','Demo',NOW()),
  ('AT-201','Settled Water Turbidity','Treatment','analyser','Hach','SC1000','HAAN-1002',0.0,10.0,'NTU','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2025-10-31','fail','2026-01-29','Demo',NOW()),
  ('AT-202','Settled Water pH','Treatment','analyser','YSI','Pro Plus','YSAN-1003',4.0,10.0,'pH','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2025-10-25','pass','2026-01-23','Demo',NOW()),
  ('AT-203','Alum Concentration','Treatment','analyser','WTW','IQ SensorNet','WTAN-1002',0.0,100.0,'%','4-20mA',180,'percent_span',2.0,5,'standard','active','2026-02-03','pass','2026-08-02','Demo',NOW()),
  ('AT-204','Coagulation Zeta Potential','Treatment','analyser','Hach','SC1000','HAAN-1003',-60.0,60.0,'mV','4-20mA',180,'percent_span',2.0,5,'standard','active','2025-11-30','marginal','2026-05-29','Demo',NOW()),
  ('SV-201','Settled Water Control Valve','Treatment','valve','Auma','SARV','AUVA-1002',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2025-10-23','marginal','2026-10-23','Demo',NOW()),
  ('SV-202','Sludge Drain Valve Position','Treatment','valve','Biffi','ICON2','BIVA-1001',0.0,100.0,'%','4-20mA',365,'percent_span',2.0,3,'standard','active','2025-11-16','pass','2026-11-16','Demo',NOW()),
  ('SV-203','Alum Dosing Valve','Treatment','valve','Rotork','IQ3','ROVA-1002',0.0,100.0,'%','4-20mA',180,'percent_span',1.0,3,'process_critical','active','2026-02-07','pass','2026-08-06','Demo',NOW()),
  ('PS-201','Sedimentation Overflow Pressure','Treatment','switch','WIKA','GS-02','WISW-1002',0.0,1.0,'Bool','4-20mA',365,'absolute',1,3,'process_critical','active','2025-12-15','marginal','2026-12-15','Demo',NOW()),
  ('LS-201','Sludge Sump High Level Switch','Treatment','switch','Gems Sensors','26700','GESW-1003',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'process_critical','active','2025-12-22','marginal','2026-06-20','Demo',NOW()),
  ('LS-202','Settled Water Tank High Level','Treatment','switch','Endress+Hauser','FTW23','ENSW-1002',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2025-09-05','fail','2026-03-04','Demo',NOW()),
  ('PT-202','Flocculation Mix Pressure','Treatment','pressure','Rosemount','3051','ROPR-1003',0.0,100.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-11-27','pass','2026-11-27','Demo',NOW()),
  ('PT-203','Sedimentation Inlet Pressure','Treatment','pressure','Yokogawa','EJA110E','YOPR-1002',0.0,300.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-15','pass','2027-03-15','Demo',NOW()),
  ('FT-206','Recycle Flow','Treatment','flow','Endress+Hauser','Promag 10W','ENFL-1004',0.0,500.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-20','pass','2027-03-20','Demo',NOW()),
  ('AT-205','Settled Water Alkalinity','Treatment','analyser','YSI','Pro Plus','YSAN-1004',0.0,200.0,'mg/L','4-20mA',180,'percent_span',2.0,5,'standard','active','2025-12-14','marginal','2026-06-12','Demo',NOW()),
  ('TT-203','Flocculation Tank Temperature','Treatment','temperature','ABB','TSP341','ABTE-1004',0.0,40.0,'degC','4-20mA',730,'percent_span',2.0,5,'non_critical','active','2025-09-29','pass','2027-09-29','Demo',NOW()),
  ('LT-205','Settled Water Storage Level','Treatment','level','Endress+Hauser','FMB50','ENLE-1003',0.0,8.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-26','marginal','2026-08-25','Demo',NOW()),
  ('FT-207','Backwash Water Flow','Treatment','flow','Krohne','IFC 050','KRFL-1005',0.0,2000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-10','pass','2026-09-06','Demo',NOW()),
  ('PT-204','Backwash Header Pressure','Treatment','pressure','Yokogawa','EJA110E','YOPR-1003',0.0,400.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-05','pass','2026-09-01','Demo',NOW()),
  ('AT-206','Settled Water TOC','Treatment','analyser','Hach','SC1000','HAAN-1004',0.0,20.0,'mg/L','4-20mA',180,'percent_span',2.0,5,'standard','active','2026-02-21','marginal','2026-08-20','Demo',NOW()),
  ('AT-207','Coag Dose Controller pH','Treatment','analyser','YSI','Pro Plus','YSAN-1005',4.0,10.0,'pH','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2026-02-23','pass','2026-05-24','Demo',NOW()),
  ('FS-201','Backwash Pump Flow Switch','Treatment','switch','Gems Sensors','26700','GESW-1004',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'process_critical','active','2025-12-25','marginal','2026-06-23','Demo',NOW()),
  ('PT-205','Lamella Plate DP','Treatment','pressure','Endress+Hauser','Cerabar M','ENPR-1006',0.0,50.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-06-01','marginal','2026-06-01','Demo',NOW()),
  ('LT-206','Chemical Day Tank Level','Treatment','level','Rosemount','3300','ROLE-1004',0.0,2.0,'m','4-20mA',730,'percent_span',2.0,5,'non_critical','active','2025-07-06','pass','2027-07-06','Demo',NOW()),
  ('PT-301','Filter 1 Inlet Pressure','Filtration','pressure','Yokogawa','EJA110E','YOPR-1004',0.0,400.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-31','pass','2026-09-27','Demo',NOW()),
  ('PT-302','Filter 2 Inlet Pressure','Filtration','pressure','Endress+Hauser','Cerabar M','ENPR-1007',0.0,400.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-11-16','pass','2026-05-15','Demo',NOW()),
  ('PT-303','Filter 1 DP','Filtration','pressure','Rosemount','3051','ROPR-1004',0.0,80.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-07-27','pass','2026-01-23','Demo',NOW()),
  ('PT-304','Filter 2 DP','Filtration','pressure','Yokogawa','EJA110E','YOPR-1005',0.0,80.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-05','pass','2026-09-01','Demo',NOW()),
  ('PT-305','Filter 3 DP','Filtration','pressure','Endress+Hauser','Cerabar M','ENPR-1008',0.0,80.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-17','marginal','2027-01-17','Demo',NOW()),
  ('FT-301','Filter 1 Effluent Flow','Filtration','flow','Krohne','IFC 050','KRFL-1006',0.0,1500.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-21','marginal','2026-08-20','Demo',NOW()),
  ('FT-302','Filter 2 Effluent Flow','Filtration','flow','Yokogawa','ADMAG AXF','YOFL-1005',0.0,1500.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-04-02','pass','2026-09-29','Demo',NOW()),
  ('FT-303','Filter 3 Effluent Flow','Filtration','flow','Endress+Hauser','Promag 10W','ENFL-1005',0.0,1500.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-08','marginal','2027-01-08','Demo',NOW()),
  ('FT-304','Filter Backwash Flow','Filtration','flow','Krohne','IFC 050','KRFL-1007',0.0,3000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-16','pass','2026-08-15','Demo',NOW()),
  ('LT-301','Filter 1 Water Level','Filtration','level','VEGA','VEGABAR 82','VELE-1004',0.0,3.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-01-16','pass','2026-07-15','Demo',NOW()),
  ('LT-302','Filter 2 Water Level','Filtration','level','Endress+Hauser','FMB50','ENLE-1004',0.0,3.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-02-22','pass','2026-08-21','Demo',NOW()),
  ('LT-303','Filter 3 Water Level','Filtration','level','Rosemount','3300','ROLE-1005',0.0,3.0,'m','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-10','pass','2027-01-10','Demo',NOW()),
  ('LT-304','Filtered Water Tank Level','Filtration','level','VEGA','VEGABAR 82','VELE-1005',0.0,8.0,'m','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-01-10','marginal','2026-07-09','Demo',NOW()),
  ('TT-301','Filtered Water Temperature','Filtration','temperature','Endress+Hauser','TMT162','ENTE-1002',0.0,40.0,'degC','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-24','pass','2027-03-24','Demo',NOW()),
  ('AT-301','Filter 1 Effluent Turbidity','Filtration','analyser','YSI','Pro Plus','YSAN-1006',0.0,2.0,'NTU','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-10-15','fail','2026-01-13','Demo',NOW()),
  ('AT-302','Filter 2 Effluent Turbidity','Filtration','analyser','WTW','IQ SensorNet','WTAN-1003',0.0,2.0,'NTU','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-10-21','pass','2026-01-19','Demo',NOW()),
  ('AT-303','Filter 3 Effluent Turbidity','Filtration','analyser','Hach','SC1000','HAAN-1005',0.0,2.0,'NTU','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2026-03-18','pass','2026-06-16','Demo',NOW()),
  ('AT-304','Combined Filter Effluent Turbidity','Filtration','analyser','YSI','Pro Plus','YSAN-1007',0.0,2.0,'NTU','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-11-28','pass','2026-02-26','Demo',NOW()),
  ('AT-305','Filter Effluent pH','Filtration','analyser','WTW','IQ SensorNet','WTAN-1004',4.0,10.0,'pH','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2026-03-08','marginal','2026-06-06','Demo',NOW()),
  ('SV-301','Filter 1 Inlet Valve','Filtration','valve','Rotork','IQ3','ROVA-1003',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2026-04-05','pass','2027-04-05','Demo',NOW()),
  ('SV-302','Filter 2 Inlet Valve','Filtration','valve','Auma','SARV','AUVA-1003',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2025-07-28','pass','2026-07-28','Demo',NOW()),
  ('SV-303','Filter 1 Backwash Valve','Filtration','valve','Biffi','ICON2','BIVA-1002',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2025-07-04','pass','2026-07-04','Demo',NOW()),
  ('SV-304','Filter 2 Backwash Valve','Filtration','valve','Rotork','IQ3','ROVA-1004',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2026-01-27','marginal','2027-01-27','Demo',NOW()),
  ('PS-301','Filter 1 High DP Trip','Filtration','switch','WIKA','GS-02','WISW-1003',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2025-07-16','pass','2026-01-12','Demo',NOW()),
  ('PS-302','Filter 2 High DP Trip','Filtration','switch','Gems Sensors','26700','GESW-1005',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-01-25','marginal','2026-07-24','Demo',NOW()),
  ('LS-301','Filtered Water Tank High Level','Filtration','switch','Endress+Hauser','FTW23','ENSW-1003',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-02-07','pass','2026-08-06','Demo',NOW()),
  ('LS-302','Filtered Water Tank Low Level','Filtration','switch','WIKA','GS-02','WISW-1004',0.0,1.0,'Bool','4-20mA',365,'absolute',1,3,'process_critical','active','2025-10-25','marginal','2026-10-25','Demo',NOW()),
  ('PT-306','Filter 4 DP','Filtration','pressure','Yokogawa','EJA110E','YOPR-1006',0.0,80.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-09-23','marginal','2026-09-23','Demo',NOW()),
  ('FT-305','Filter 4 Effluent Flow','Filtration','flow','Endress+Hauser','Promag 10W','ENFL-1006',0.0,1500.0,'m3/h','4-20mA',365,'percent_span',1.0,5,'standard','active','2025-07-12','marginal','2026-07-12','Demo',NOW()),
  ('LT-305','Filter 4 Water Level','Filtration','level','Rosemount','3300','ROLE-1006',0.0,3.0,'m','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-31','pass','2027-01-31','Demo',NOW()),
  ('AT-306','Filter 4 Effluent Turbidity','Filtration','analyser','WTW','IQ SensorNet','WTAN-1005',0.0,2.0,'NTU','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2026-03-31','pass','2026-06-29','Demo',NOW()),
  ('PT-307','Filtered Water Pump Suction','Filtration','pressure','Endress+Hauser','Cerabar M','ENPR-1009',0.0,200.0,'kPa','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-03-01','pass','2027-03-01','Demo',NOW()),
  ('PT-308','Filtered Water Pump Discharge','Filtration','pressure','Rosemount','3051','ROPR-1005',0.0,800.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-28','pass','2026-09-24','Demo',NOW()),
  ('AT-307','Filtered Water Chlorine Demand','Filtration','analyser','WTW','IQ SensorNet','WTAN-1006',0.0,10.0,'mg/L','4-20mA',180,'percent_span',2.0,5,'standard','active','2026-02-05','pass','2026-08-04','Demo',NOW()),
  ('TT-302','Filtered Water Pump Bearing Temp','Filtration','temperature','Endress+Hauser','TMT162','ENTE-1003',0.0,120.0,'degC','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2026-03-15','pass','2026-09-11','Demo',NOW()),
  ('AT-401','Chlorine Dose Point Residual','Disinfection & Distribution','analyser','YSI','Pro Plus','YSAN-1008',0.0,10.0,'mg/L','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-11-29','fail','2026-02-27','Demo',NOW()),
  ('AT-402','Post-Chlorination Free Cl2','Disinfection & Distribution','analyser','WTW','IQ SensorNet','WTAN-1007',0.0,10.0,'mg/L','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-12-11','pass','2026-03-11','Demo',NOW()),
  ('AT-403','Network Entry Point Free Cl2','Disinfection & Distribution','analyser','Hach','SC1000','HAAN-1006',0.0,10.0,'mg/L','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2026-03-29','pass','2026-06-27','Demo',NOW()),
  ('AT-404','pH Post Disinfection','Disinfection & Distribution','analyser','YSI','Pro Plus','YSAN-1009',4.0,10.0,'pH','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2026-03-16','marginal','2026-06-14','Demo',NOW()),
  ('AT-405','UV Transmittance','Disinfection & Distribution','analyser','WTW','IQ SensorNet','WTAN-1008',0.0,100.0,'%','4-20mA',90,'percent_span',1.0,5,'process_critical','active','2026-03-20','pass','2026-06-18','Demo',NOW()),
  ('AT-406','Fluoride Residual','Disinfection & Distribution','analyser','Hach','SC1000','HAAN-1007',0.0,5.0,'mg/L','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-10-28','pass','2026-01-26','Demo',NOW()),
  ('AT-407','Network Cl2 Remote Zone 1','Disinfection & Distribution','analyser','YSI','Pro Plus','YSAN-1010',0.0,10.0,'mg/L','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2025-12-30','marginal','2026-06-28','Demo',NOW()),
  ('AT-408','Network Cl2 Remote Zone 2','Disinfection & Distribution','analyser','WTW','IQ SensorNet','WTAN-1009',0.0,10.0,'mg/L','4-20mA',180,'percent_span',1.0,5,'process_critical','active','2025-12-30','marginal','2026-06-28','Demo',NOW()),
  ('FT-401','Chlorine Gas Flow','Disinfection & Distribution','flow','Endress+Hauser','Promag 10W','ENFL-1007',0.0,50.0,'kg/h','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2025-11-13','fail','2026-02-11','Demo',NOW()),
  ('FT-402','Sodium Hypochlorite Dosing Flow','Disinfection & Distribution','flow','Krohne','IFC 050','KRFL-1008',0.0,500.0,'L/h','4-20mA',90,'percent_span',0.5,5,'safety_critical','active','2026-03-03','marginal','2026-06-01','Demo',NOW()),
  ('FT-403','Fluoride Dosing Flow','Disinfection & Distribution','flow','Yokogawa','ADMAG AXF','YOFL-1006',0.0,100.0,'L/h','4-20mA',180,'percent_span',0.5,5,'safety_critical','active','2026-02-13','pass','2026-08-12','Demo',NOW()),
  ('FT-404','Treated Water to Distribution','Disinfection & Distribution','flow','Endress+Hauser','Promag 10W','ENFL-1008',0.0,8000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-04-04','pass','2026-10-01','Demo',NOW()),
  ('FT-405','Zone 1 Distribution Flow','Disinfection & Distribution','flow','Krohne','IFC 050','KRFL-1009',0.0,3000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-12-13','pass','2026-06-11','Demo',NOW()),
  ('FT-406','Zone 2 Distribution Flow','Disinfection & Distribution','flow','Yokogawa','ADMAG AXF','YOFL-1007',0.0,2000.0,'m3/h','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2025-12-15','marginal','2026-06-13','Demo',NOW()),
  ('PT-401','Distribution Header Pressure','Disinfection & Distribution','pressure','Endress+Hauser','Cerabar M','ENPR-1010',0.0,800.0,'kPa','4-20mA',180,'percent_span',0.5,5,'safety_critical','active','2025-12-04','pass','2026-06-02','Demo',NOW()),
  ('PT-402','Zone 1 Network Pressure','Disinfection & Distribution','pressure','Rosemount','3051','ROPR-1006',0.0,600.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-08','pass','2026-09-04','Demo',NOW()),
  ('PT-403','Zone 2 Network Pressure','Disinfection & Distribution','pressure','Yokogawa','EJA110E','YOPR-1007',0.0,600.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-03-26','pass','2026-09-22','Demo',NOW()),
  ('PT-404','UV Reactor Inlet Pressure','Disinfection & Distribution','pressure','Endress+Hauser','Cerabar M','ENPR-1011',0.0,300.0,'kPa','4-20mA',180,'percent_span',0.5,5,'process_critical','active','2026-01-06','pass','2026-07-05','Demo',NOW()),
  ('LT-401','Treated Water Storage Level','Disinfection & Distribution','level','Rosemount','3300','ROLE-1007',0.0,12.0,'m','4-20mA',180,'percent_span',0.5,5,'safety_critical','active','2026-01-29','pass','2026-07-28','Demo',NOW()),
  ('LT-402','Chemical Day Tank Cl2 Level','Disinfection & Distribution','level','VEGA','VEGABAR 82','VELE-1006',0.0,3.0,'m','4-20mA',365,'percent_span',1.0,5,'process_critical','active','2026-02-17','marginal','2027-02-17','Demo',NOW()),
  ('LT-403','Fluoride Tank Level','Disinfection & Distribution','level','Endress+Hauser','FMB50','ENLE-1005',0.0,2.0,'m','4-20mA',365,'percent_span',1.0,5,'process_critical','active','2025-07-02','marginal','2026-07-02','Demo',NOW()),
  ('TT-401','Treated Water Temperature','Disinfection & Distribution','temperature','Rosemount','644','ROTE-1002',0.0,40.0,'degC','4-20mA',365,'percent_span',1.0,5,'standard','active','2026-01-21','marginal','2027-01-21','Demo',NOW()),
  ('PS-401','Low Pressure Trip Network','Disinfection & Distribution','switch','Gems Sensors','26700','GESW-1006',0.0,1.0,'Bool','4-20mA',90,'absolute',1,3,'safety_critical','active','2025-12-02','fail','2026-03-02','Demo',NOW()),
  ('PS-402','Cl2 Gas Leak Switch','Disinfection & Distribution','switch','Endress+Hauser','FTW23','ENSW-1004',0.0,1.0,'Bool','4-20mA',90,'absolute',1,3,'safety_critical','active','2026-03-18','pass','2026-06-16','Demo',NOW()),
  ('FS-401','Distribution Pump 1 Flow Switch','Disinfection & Distribution','switch','WIKA','GS-02','WISW-1005',0.0,1.0,'Bool','4-20mA',90,'absolute',1,3,'safety_critical','active','2026-03-05','pass','2026-06-03','Demo',NOW()),
  ('LS-401','Treated Storage High Level Switch','Disinfection & Distribution','switch','Gems Sensors','26700','GESW-1007',0.0,1.0,'Bool','4-20mA',180,'absolute',1,3,'safety_critical','active','2026-03-21','pass','2026-09-17','Demo',NOW()),
  ('SV-401','Distribution Pressure Control Vv','Disinfection & Distribution','valve','Rotork','IQ3','ROVA-1005',0.0,100.0,'%','4-20mA',365,'percent_span',1.0,3,'process_critical','active','2026-02-14','pass','2027-02-14','Demo',NOW()),
  ('SV-402','Cl2 Metering Valve','Disinfection & Distribution','valve','Auma','SARV','AUVA-1004',0.0,100.0,'%','4-20mA',180,'percent_span',0.5,3,'safety_critical','active','2026-02-19','marginal','2026-08-18','Demo',NOW()),
  ('SV-403','Fluoride Dosing Valve','Disinfection & Distribution','valve','Biffi','ICON2','BIVA-1003',0.0,100.0,'%','4-20mA',180,'percent_span',0.5,3,'safety_critical','active','2025-11-29','marginal','2026-05-28','Demo',NOW()),
  ('AT-409','Cryptosporidium Surrogate Monitor','Disinfection & Distribution','analyser','Hach','SC1000','HAAN-1008',0.0,1.0,'log','4-20mA',90,'percent_span',1.0,5,'safety_critical','active','2026-03-20','marginal','2026-06-18','Demo',NOW());

-- ── Calibration Records and Test Points ─────────────────
DO $$
DECLARE
  v_inst_id UUID;
  v_rec_id  UUID;
BEGIN

  -- PT-101: Raw Water Inlet Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-18', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT101', false,
    'pass', 'pass',
    0.074, 0.067,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4467, 0.4467, 0.4467, 0.0745, 0.4467, 0.0745, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 150.0, 150.0, 150.4467, 150.4467, 0.4467, 0.0745, 0.4467, 0.0745, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 300.0, 300.0, 300.4467, 300.4467, 0.4467, 0.0745, 0.4467, 0.0745, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 450.0, 450.0, 450.4467, 450.4467, 0.4467, 0.0745, 0.4467, 0.0745, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 600.0, 600.0, 600.4467, 600.4467, 0.4467, 0.0745, 0.4467, 0.0745, 'pass', 'pass');

  -- PT-102: Screen Inlet DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT102', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.035, 0.035, 0.035, 0.035, 0.035, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.0388, 25.0388, 0.0387, 0.0387, 0.0387, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.0425, 50.0425, 0.0425, 0.0425, 0.0425, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.0463, 75.0463, 0.0462, 0.0462, 0.0462, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.05, 100.05, 0.05, 0.05, 0.05, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-15', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-PT102', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.14, 0.14, 0.14, 0.14, 0.14, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.155, 25.155, 0.155, 0.155, 0.155, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.17, 50.17, 0.17, 0.17, 0.17, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.185, 75.185, 0.185, 0.185, 0.185, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.2, 100.2, 0.2, 0.2, 0.2, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-PT102', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.245, 0.245, 0.245, 0.245, 0.245, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.2712, 25.2712, 0.2712, 0.2712, 0.2712, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.2975, 50.2975, 0.2975, 0.2975, 0.2975, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.3238, 75.3238, 0.3237, 0.3237, 0.3237, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.35, 100.35, 0.35, 0.35, 0.35, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-PT102', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.3875, 25.3875, 0.3875, 0.3875, 0.3875, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.425, 50.425, 0.425, 0.425, 0.425, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.4625, 75.4625, 0.4625, 0.4625, 0.4625, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.5, 100.5, 0.5, 0.5, 0.5, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT102', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.455, 0.455, 0.455, 0.455, 0.455, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.5038, 25.5038, 0.5037, 0.5037, 0.5037, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.5525, 50.5525, 0.5525, 0.5525, 0.5525, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.6012, 75.6012, 0.6012, 0.6012, 0.6012, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.65, 100.65, 0.65, 0.65, 0.65, 0.65, 'pass', 'pass');

  -- PT-103: Pump 1 Discharge Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-103' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-103 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-16', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT103', false, NULL, NULL,
    'pass', 'pass',
    0.198, 0.198,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.978, 1.978, 1.978, 0.1978, 1.978, 0.1978, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 250.0, 250.0, 251.978, 251.978, 1.978, 0.1978, 1.978, 0.1978, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 500.0, 500.0, 501.978, 501.978, 1.978, 0.1978, 1.978, 0.1978, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 750.0, 750.0, 751.978, 751.978, 1.978, 0.1978, 1.978, 0.1978, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1000.0, 1000.0, 1001.978, 1001.978, 1.978, 0.1978, 1.978, 0.1978, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-07', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-PT103', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 6.5, 0.325, 6.5, 0.65, 0.325, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 250.0, 250.0, 256.5, 250.325, 6.5, 0.65, 0.325, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 500.0, 500.0, 506.5, 500.325, 6.5, 0.65, 0.325, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 750.0, 750.0, 756.5, 750.325, 6.5, 0.65, 0.325, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1000.0, 1000.0, 1006.5, 1000.325, 6.5, 0.65, 0.325, 0.0325, 'fail', 'pass');

  -- PT-104: Pump 2 Discharge Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-104' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-104 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-26', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT104', false,
    'pass', 'pass',
    0.079, 0.071,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7852, 0.7852, 0.7852, 0.0785, 0.7852, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 250.0, 250.0, 250.7852, 250.7852, 0.7852, 0.0785, 0.7852, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 500.0, 500.0, 500.7852, 500.7852, 0.7852, 0.0785, 0.7852, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 750.0, 750.0, 750.7852, 750.7852, 0.7852, 0.0785, 0.7852, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1000.0, 1000.0, 1000.7852, 1000.7852, 0.7852, 0.0785, 0.7852, 0.0785, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-03-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-PT104', false,
    'pass', 'pass',
    0.149, 0.134,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.4928, 1.4928, 1.4928, 0.1493, 1.4928, 0.1493, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 250.0, 250.0, 251.4928, 251.4928, 1.4928, 0.1493, 1.4928, 0.1493, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 500.0, 500.0, 501.4928, 501.4928, 1.4928, 0.1493, 1.4928, 0.1493, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 750.0, 750.0, 751.4928, 751.4928, 1.4928, 0.1493, 1.4928, 0.1493, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1000.0, 1000.0, 1001.4928, 1001.4928, 1.4928, 0.1493, 1.4928, 0.1493, 'pass', 'pass');

  -- PT-105: Pump 3 Discharge Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-105' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-105 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-29', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT105', false,
    'pass', 'pass',
    0.072, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.718, 0.718, 0.718, 0.0718, 0.718, 0.0718, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 250.0, 250.0, 250.718, 250.718, 0.718, 0.0718, 0.718, 0.0718, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 500.0, 500.0, 500.718, 500.718, 0.718, 0.0718, 0.718, 0.0718, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 750.0, 750.0, 750.718, 750.718, 0.718, 0.0718, 0.718, 0.0718, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1000.0, 1000.0, 1000.718, 1000.718, 0.718, 0.0718, 0.718, 0.0718, 'pass', 'pass');

  -- FT-101: Raw Water Intake Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-10', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-FT101', false, NULL, NULL,
    'pass', 'pass',
    0.083, 0.083,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 4.1328, 4.1328, 4.1328, 0.0827, 4.1328, 0.0827, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1250.0, 1250.0, 1254.1328, 1254.1328, 4.1328, 0.0827, 4.1328, 0.0827, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2500.0, 2500.0, 2504.1328, 2504.1328, 4.1328, 0.0827, 4.1328, 0.0827, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3750.0, 3750.0, 3754.1328, 3754.1328, 4.1328, 0.0827, 4.1328, 0.0827, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5000.0, 5000.0, 5004.1328, 5004.1328, 4.1328, 0.0827, 4.1328, 0.0827, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-09', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-FT101', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 32.5, 1.625, 32.5, 0.65, 1.625, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1250.0, 1250.0, 1282.5, 1251.625, 32.5, 0.65, 1.625, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2500.0, 2500.0, 2532.5, 2501.625, 32.5, 0.65, 1.625, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3750.0, 3750.0, 3782.5, 3751.625, 32.5, 0.65, 1.625, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5000.0, 5000.0, 5032.5, 5001.625, 32.5, 0.65, 1.625, 0.0325, 'fail', 'pass');

  -- FT-102: Screen Bypass Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-29', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-FT102', false,
    'pass', 'pass',
    0.065, 0.058,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.2949, 1.2949, 1.2949, 0.0647, 1.2949, 0.0647, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 501.2949, 501.2949, 1.2949, 0.0647, 1.2949, 0.0647, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1001.2949, 1001.2949, 1.2949, 0.0647, 1.2949, 0.0647, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1501.2949, 1501.2949, 1.2949, 0.0647, 1.2949, 0.0647, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2001.2949, 2001.2949, 1.2949, 0.0647, 1.2949, 0.0647, 'pass', 'pass');

  -- FT-103: Pump 1 Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-103' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-103 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-FT103', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7, 0.7, 0.7, 0.035, 0.7, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 500.775, 500.775, 0.775, 0.0387, 0.775, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1000.85, 1000.85, 0.85, 0.0425, 0.85, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1500.925, 1500.925, 0.925, 0.0462, 0.925, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2001.0, 2001.0, 1.0, 0.05, 1.0, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-FT103', false, NULL, NULL,
    'pass', 'pass',
    0.125, 0.113,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.75, 1.75, 1.75, 0.0875, 1.75, 0.0875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 501.9375, 501.9375, 1.9375, 0.0969, 1.9375, 0.0969, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1002.125, 1002.125, 2.125, 0.1063, 2.125, 0.1063, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1502.3125, 1502.3125, 2.3125, 0.1156, 2.3125, 0.1156, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2002.5, 2002.5, 2.5, 0.125, 2.5, 0.125, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-FT103', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 2.8, 2.8, 2.8, 0.14, 2.8, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 503.1, 503.1, 3.1, 0.155, 3.1, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1003.4, 1003.4, 3.4, 0.17, 3.4, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1503.7, 1503.7, 3.7, 0.185, 3.7, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2004.0, 2004.0, 4.0, 0.2, 4.0, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-FT103', false, NULL, NULL,
    'marginal', 'marginal',
    0.275, 0.247,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 3.85, 3.85, 3.85, 0.1925, 3.85, 0.1925, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 504.2625, 504.2625, 4.2625, 0.2131, 4.2625, 0.2131, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1004.675, 1004.675, 4.675, 0.2337, 4.675, 0.2337, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1505.0875, 1505.0875, 5.0875, 0.2544, 5.0875, 0.2544, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2005.5, 2005.5, 5.5, 0.275, 5.5, 0.275, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-FT103', false, NULL, NULL,
    'marginal', 'marginal',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 4.9, 4.9, 4.9, 0.245, 4.9, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 505.425, 505.425, 5.425, 0.2712, 5.425, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1005.95, 1005.95, 5.95, 0.2975, 5.95, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1506.475, 1506.475, 6.475, 0.3237, 6.475, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2007.0, 2007.0, 7.0, 0.35, 7.0, 0.35, 'pass', 'pass');

  -- LT-101: Raw Water Sump Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-07', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-LT101', false, NULL, NULL,
    'pass', 'pass',
    0.059, 0.059,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0029, 0.0029, 0.0029, 0.0586, 0.0029, 0.0586, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2529, 1.2529, 0.0029, 0.0586, 0.0029, 0.0586, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5029, 2.5029, 0.0029, 0.0586, 0.0029, 0.0586, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7529, 3.7529, 0.0029, 0.0586, 0.0029, 0.0586, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0029, 5.0029, 0.0029, 0.0586, 0.0029, 0.0586, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-02', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-LT101', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0325, 0.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2825, 1.2516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5325, 2.5016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7825, 3.7516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0325, 5.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');

  -- LT-102: Screen Channel Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-19', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-LT102', false,
    'pass', 'pass',
    0.554, 0.499,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0166, 0.0166, 0.0166, 0.5541, 0.0166, 0.5541, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7666, 0.7666, 0.0166, 0.5541, 0.0166, 0.5541, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5166, 1.5166, 0.0166, 0.5541, 0.0166, 0.5541, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2666, 2.2666, 0.0166, 0.5541, 0.0166, 0.5541, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0166, 3.0166, 0.0166, 0.5541, 0.0166, 0.5541, 'pass', 'pass');

  -- LT-103: Raw Water Storage Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-103' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-103 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-18', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-LT103', false,
    'pass', 'pass',
    0.073, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0073, 0.0073, 0.0073, 0.0725, 0.0073, 0.0725, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5073, 2.5073, 0.0073, 0.0725, 0.0073, 0.0725, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0073, 5.0073, 0.0073, 0.0725, 0.0073, 0.0725, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5073, 7.5073, 0.0073, 0.0725, 0.0073, 0.0725, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0073, 10.0073, 0.0073, 0.0725, 0.0073, 0.0725, 'pass', 'pass');

  -- TT-101: Raw Water Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-16', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-TT101', false,
    'pass', 'pass',
    0.076, 0.068,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0303, 0.0303, 0.0303, 0.0757, 0.0303, 0.0757, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.0303, 10.0303, 0.0303, 0.0757, 0.0303, 0.0757, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.0303, 20.0303, 0.0303, 0.0757, 0.0303, 0.0757, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.0303, 30.0303, 0.0303, 0.0757, 0.0303, 0.0757, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.0303, 40.0303, 0.0303, 0.0757, 0.0303, 0.0757, 'pass', 'pass');

  -- AT-101: Raw Water Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-22', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-AT101', false, NULL, NULL,
    'pass', 'pass',
    0.06, 0.06,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0603, 0.0603, 0.0603, 0.0603, 0.0603, 0.0603, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.0603, 25.0603, 0.0603, 0.0603, 0.0603, 0.0603, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.0603, 50.0603, 0.0603, 0.0603, 0.0603, 0.0603, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.0603, 75.0603, 0.0603, 0.0603, 0.0603, 0.0603, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.0603, 100.0603, 0.0603, 0.0603, 0.0603, 0.0603, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-09', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-AT101', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.3, 0.065, 1.3, 1.3, 0.065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 26.3, 25.065, 1.3, 1.3, 0.065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 51.3, 50.065, 1.3, 1.3, 0.065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 76.3, 75.065, 1.3, 1.3, 0.065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 101.3, 100.065, 1.3, 1.3, 0.065, 0.065, 'fail', 'pass');

  -- AT-102: Raw Water pH
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-15', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-AT102', false, NULL, NULL,
    'pass', 'pass',
    0.111, 0.111,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0066, 4.0066, 0.0066, 0.1106, 0.0066, 0.1106, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5066, 5.5066, 0.0066, 0.1106, 0.0066, 0.1106, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0066, 7.0066, 0.0066, 0.1106, 0.0066, 0.1106, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5066, 8.5066, 0.0066, 0.1106, 0.0066, 0.1106, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0066, 10.0066, 0.0066, 0.1106, 0.0066, 0.1106, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-AT102', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.078, 4.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.578, 5.5039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.078, 7.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.578, 8.5039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.078, 10.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');

  -- AT-103: Raw Water Dissolved Oxygen
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-103' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-103 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-AT103', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.007, 0.007, 0.007, 0.035, 0.007, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.0077, 5.0077, 0.0077, 0.0387, 0.0077, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.0085, 10.0085, 0.0085, 0.0425, 0.0085, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.0092, 15.0092, 0.0092, 0.0462, 0.0092, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.01, 20.01, 0.01, 0.05, 0.01, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-AT103', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.049, 0.049, 0.049, 0.245, 0.049, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.0542, 5.0542, 0.0542, 0.2712, 0.0542, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.0595, 10.0595, 0.0595, 0.2975, 0.0595, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.0648, 15.0648, 0.0647, 0.3237, 0.0647, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.07, 20.07, 0.07, 0.35, 0.07, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-AT103', false, NULL, NULL,
    'pass', 'pass',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.091, 0.091, 0.091, 0.455, 0.091, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.1007, 5.1007, 0.1007, 0.5037, 0.1007, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.1105, 10.1105, 0.1105, 0.5525, 0.1105, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.1203, 15.1203, 0.1202, 0.6012, 0.1202, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.13, 20.13, 0.13, 0.65, 0.13, 0.65, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-AT103', false, NULL, NULL,
    'marginal', 'marginal',
    0.95, 0.855,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.133, 0.133, 0.133, 0.665, 0.133, 0.665, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.1472, 5.1472, 0.1472, 0.7362, 0.1472, 0.7362, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.1615, 10.1615, 0.1615, 0.8075, 0.1615, 0.8075, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.1758, 15.1758, 0.1757, 0.8788, 0.1757, 0.8788, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.19, 20.19, 0.19, 0.95, 0.19, 0.95, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-AT103', false, NULL, NULL,
    'marginal', 'marginal',
    1.25, 1.125,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.175, 0.175, 0.175, 0.875, 0.175, 0.875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.1937, 5.1937, 0.1937, 0.9687, 0.1937, 0.9687, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.2125, 10.2125, 0.2125, 1.0625, 0.2125, 1.0625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.2312, 15.2312, 0.2312, 1.1562, 0.2312, 1.1562, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.25, 20.25, 0.25, 1.25, 0.25, 1.25, 'pass', 'pass');

  -- SV-101: Intake Isolating Valve Position
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-15', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-SV101', false,
    'pass', 'pass',
    0.318, 0.286,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3181, 0.3181, 0.3181, 0.3181, 0.3181, 0.3181, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3181, 50.3181, 0.3181, 0.3181, 0.3181, 0.3181, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3181, 100.3181, 0.3181, 0.3181, 0.3181, 0.3181, 'pass', 'pass');

  -- SV-102: Screen Bypass Valve Position
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-02', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-SV102', false,
    'pass', 'pass',
    0.076, 0.069,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0765, 0.0765, 0.0765, 0.0765, 0.0765, 0.0765, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.0765, 50.0765, 0.0765, 0.0765, 0.0765, 0.0765, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.0765, 100.0765, 0.0765, 0.0765, 0.0765, 0.0765, 'pass', 'pass');

  -- FS-101: Pump 1 Flow Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FS-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FS-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-13', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-FS101', false,
    'pass', 'pass',
    0.269, 0.242,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0027, 0.0027, 0.0027, 0.269, 0.0027, 0.269, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5027, 0.5027, 0.0027, 0.269, 0.0027, 0.269, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0027, 1.0027, 0.0027, 0.269, 0.0027, 0.269, 'pass', 'pass');

  -- FS-102: Pump 2 Flow Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FS-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FS-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-04', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-FS102', false,
    'pass', 'pass',
    0.352, 0.317,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0035, 0.0035, 0.0035, 0.3522, 0.0035, 0.3522, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5035, 0.5035, 0.0035, 0.3522, 0.0035, 0.3522, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0035, 1.0035, 0.0035, 0.3522, 0.0035, 0.3522, 'pass', 'pass');

  -- PS-101: High Pressure Trip Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-101' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-101 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-12', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-PS101', false,
    'pass', 'pass',
    0.563, 0.507,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0056, 0.0056, 0.0056, 0.5628, 0.0056, 0.5628, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5056, 0.5056, 0.0056, 0.5628, 0.0056, 0.5628, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0056, 1.0056, 0.0056, 0.5628, 0.0056, 0.5628, 'pass', 'pass');

  -- PS-102: Low Pressure Alarm Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PS102', false,
    'pass', 'pass',
    0.412, 0.371,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0041, 0.0041, 0.0041, 0.4117, 0.0041, 0.4117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5041, 0.5041, 0.0041, 0.4117, 0.0041, 0.4117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0041, 1.0041, 0.0041, 0.4117, 0.0041, 0.4117, 'pass', 'pass');

  -- PT-106: Pump 3 Suction Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-106' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-106 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-24', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-PT106', false,
    'pass', 'pass',
    0.166, 0.149,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3321, 0.3321, 0.3321, 0.1661, 0.3321, 0.1661, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3321, 50.3321, 0.3321, 0.1661, 0.3321, 0.1661, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3321, 100.3321, 0.3321, 0.1661, 0.3321, 0.1661, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.3321, 150.3321, 0.3321, 0.1661, 0.3321, 0.1661, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.3321, 200.3321, 0.3321, 0.1661, 0.3321, 0.1661, 'pass', 'pass');

  -- FT-104: Pump 2 Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-104' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-104 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-12', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-FT104', false,
    'pass', 'pass',
    0.105, 0.094,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 2.092, 2.092, 2.092, 0.1046, 2.092, 0.1046, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 502.092, 502.092, 2.092, 0.1046, 2.092, 0.1046, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1002.092, 1002.092, 2.092, 0.1046, 2.092, 0.1046, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1502.092, 1502.092, 2.092, 0.1046, 2.092, 0.1046, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2002.092, 2002.092, 2.092, 0.1046, 2.092, 0.1046, 'pass', 'pass');

  -- TT-102: Pump Motor Temperature 1
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-102' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-102 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-05', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-TT102', false,
    'pass', 'pass',
    0.096, 0.086,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.1149, 0.1149, 0.1149, 0.0957, 0.1149, 0.0957, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 30.0, 30.0, 30.1149, 30.1149, 0.1149, 0.0957, 0.1149, 0.0957, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 60.0, 60.0, 60.1149, 60.1149, 0.1149, 0.0957, 0.1149, 0.0957, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 90.0, 90.0, 90.1149, 90.1149, 0.1149, 0.0957, 0.1149, 0.0957, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 120.0, 120.0, 120.1149, 120.1149, 0.1149, 0.0957, 0.1149, 0.0957, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-04-05', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-TT102', false,
    'pass', 'pass',
    0.051, 0.046,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0617, 0.0617, 0.0617, 0.0514, 0.0617, 0.0514, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 30.0, 30.0, 30.0617, 30.0617, 0.0617, 0.0514, 0.0617, 0.0514, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 60.0, 60.0, 60.0617, 60.0617, 0.0617, 0.0514, 0.0617, 0.0514, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 90.0, 90.0, 90.0617, 90.0617, 0.0617, 0.0514, 0.0617, 0.0514, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 120.0, 120.0, 120.0617, 120.0617, 0.0617, 0.0514, 0.0617, 0.0514, 'pass', 'pass');

  -- TT-103: Pump Motor Temperature 2
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-103' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-103 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-TT103', false,
    'pass', 'pass',
    0.599, 0.539,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7189, 0.7189, 0.7189, 0.5991, 0.7189, 0.5991, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 30.0, 30.0, 30.7189, 30.7189, 0.7189, 0.5991, 0.7189, 0.5991, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 60.0, 60.0, 60.7189, 60.7189, 0.7189, 0.5991, 0.7189, 0.5991, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 90.0, 90.0, 90.7189, 90.7189, 0.7189, 0.5991, 0.7189, 0.5991, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 120.0, 120.0, 120.7189, 120.7189, 0.7189, 0.5991, 0.7189, 0.5991, 'pass', 'pass');

  -- AT-104: Raw Water Conductivity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-104' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-104 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-08', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-AT104', false,
    'pass', 'pass',
    0.116, 0.104,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 2.3143, 2.3143, 2.3143, 0.1157, 2.3143, 0.1157, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 502.3143, 502.3143, 2.3143, 0.1157, 2.3143, 0.1157, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1002.3143, 1002.3143, 2.3143, 0.1157, 2.3143, 0.1157, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1502.3143, 1502.3143, 2.3143, 0.1157, 2.3143, 0.1157, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2002.3143, 2002.3143, 2.3143, 0.1157, 2.3143, 0.1157, 'pass', 'pass');

  -- LT-104: Coagulation Tank Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-104' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-104 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-14', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-LT104', false,
    'pass', 'pass',
    0.318, 0.287,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0127, 0.0127, 0.0127, 0.3184, 0.0127, 0.3184, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.0, 1.0, 1.0127, 1.0127, 0.0127, 0.3184, 0.0127, 0.3184, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.0, 2.0, 2.0127, 2.0127, 0.0127, 0.3184, 0.0127, 0.3184, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.0, 3.0, 3.0127, 3.0127, 0.0127, 0.3184, 0.0127, 0.3184, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 4.0, 4.0, 4.0127, 4.0127, 0.0127, 0.3184, 0.0127, 0.3184, 'pass', 'pass');

  -- PT-107: Filter Feed Header Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-107' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-107 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-INT-PT107', false,
    'pass', 'pass',
    0.282, 0.254,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.4099, 1.4099, 1.4099, 0.282, 1.4099, 0.282, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 126.4099, 126.4099, 1.4099, 0.282, 1.4099, 0.282, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 251.4099, 251.4099, 1.4099, 0.282, 1.4099, 0.282, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 376.4099, 376.4099, 1.4099, 0.282, 1.4099, 0.282, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 501.4099, 501.4099, 1.4099, 0.282, 1.4099, 0.282, 'pass', 'pass');

  -- FT-105: Coagulant Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-105' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-105 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-16', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-FT105', false,
    'pass', 'pass',
    0.531, 0.478,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.5312, 0.5312, 0.5312, 0.5312, 0.5312, 0.5312, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.5312, 25.5312, 0.5312, 0.5312, 0.5312, 0.5312, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.5312, 50.5312, 0.5312, 0.5312, 0.5312, 0.5312, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.5312, 75.5312, 0.5312, 0.5312, 0.5312, 0.5312, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.5312, 100.5312, 0.5312, 0.5312, 0.5312, 0.5312, 'pass', 'pass');

  -- FT-106: Flocculant Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-106' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-106 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-25', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-FT106', false,
    'pass', 'pass',
    0.192, 0.173,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0962, 0.0962, 0.0962, 0.1924, 0.0962, 0.1924, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 12.5, 12.5, 12.5962, 12.5962, 0.0962, 0.1924, 0.0962, 0.1924, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 25.0, 25.0, 25.0962, 25.0962, 0.0962, 0.1924, 0.0962, 0.1924, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 37.5, 37.5, 37.5962, 37.5962, 0.0962, 0.1924, 0.0962, 0.1924, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 50.0, 50.0, 50.0962, 50.0962, 0.0962, 0.1924, 0.0962, 0.1924, 'pass', 'pass');

  -- PT-201: Coagulation Basin Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-21', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-PT201', false,
    'pass', 'pass',
    0.505, 0.455,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.0105, 1.0105, 1.0105, 0.5052, 1.0105, 0.5052, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 51.0105, 51.0105, 1.0105, 0.5052, 1.0105, 0.5052, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 101.0105, 101.0105, 1.0105, 0.5052, 1.0105, 0.5052, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 151.0105, 151.0105, 1.0105, 0.5052, 1.0105, 0.5052, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 201.0105, 201.0105, 1.0105, 0.5052, 1.0105, 0.5052, 'pass', 'pass');

  -- LT-201: Flocculation Tank 1 Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-09', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LT201', false, NULL, NULL,
    'pass', 'pass',
    0.142, 0.142,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0071, 0.0071, 0.0071, 0.1418, 0.0071, 0.1418, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2571, 1.2571, 0.0071, 0.1418, 0.0071, 0.1418, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5071, 2.5071, 0.0071, 0.1418, 0.0071, 0.1418, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7571, 3.7571, 0.0071, 0.1418, 0.0071, 0.1418, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0071, 5.0071, 0.0071, 0.1418, 0.0071, 0.1418, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-24', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-LT201', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0325, 0.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2825, 1.2516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5325, 2.5016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7825, 3.7516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0325, 5.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');

  -- LT-202: Flocculation Tank 2 Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-18', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LT202', false,
    'pass', 'pass',
    0.032, 0.029,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0016, 0.0016, 0.0016, 0.0321, 0.0016, 0.0321, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2516, 1.2516, 0.0016, 0.0321, 0.0016, 0.0321, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5016, 2.5016, 0.0016, 0.0321, 0.0016, 0.0321, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7516, 3.7516, 0.0016, 0.0321, 0.0016, 0.0321, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0016, 5.0016, 0.0016, 0.0321, 0.0016, 0.0321, 'pass', 'pass');

  -- LT-203: Sedimentation Basin Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LT203', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0021, 0.0021, 0.0021, 0.035, 0.0021, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.5, 1.5, 1.5023, 1.5023, 0.0023, 0.0387, 0.0023, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 3.0, 3.0, 3.0025, 3.0025, 0.0026, 0.0425, 0.0026, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 4.5, 4.5, 4.5028, 4.5028, 0.0028, 0.0462, 0.0028, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 6.0, 6.0, 6.003, 6.003, 0.003, 0.05, 0.003, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-LT203', false, NULL, NULL,
    'pass', 'pass',
    0.125, 0.113,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0052, 0.0052, 0.0052, 0.0875, 0.0052, 0.0875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.5, 1.5, 1.5058, 1.5058, 0.0058, 0.0969, 0.0058, 0.0969, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 3.0, 3.0, 3.0064, 3.0064, 0.0064, 0.1062, 0.0064, 0.1062, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 4.5, 4.5, 4.5069, 4.5069, 0.0069, 0.1156, 0.0069, 0.1156, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 6.0, 6.0, 6.0075, 6.0075, 0.0075, 0.125, 0.0075, 0.125, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-LT203', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0084, 0.0084, 0.0084, 0.14, 0.0084, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.5, 1.5, 1.5093, 1.5093, 0.0093, 0.155, 0.0093, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 3.0, 3.0, 3.0102, 3.0102, 0.0102, 0.17, 0.0102, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 4.5, 4.5, 4.5111, 4.5111, 0.0111, 0.185, 0.0111, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 6.0, 6.0, 6.012, 6.012, 0.012, 0.2, 0.012, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-LT203', false, NULL, NULL,
    'marginal', 'marginal',
    0.275, 0.247,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0115, 0.0115, 0.0115, 0.1925, 0.0115, 0.1925, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.5, 1.5, 1.5128, 1.5128, 0.0128, 0.2131, 0.0128, 0.2131, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 3.0, 3.0, 3.014, 3.014, 0.014, 0.2338, 0.014, 0.2338, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 4.5, 4.5, 4.5153, 4.5153, 0.0153, 0.2544, 0.0153, 0.2544, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 6.0, 6.0, 6.0165, 6.0165, 0.0165, 0.275, 0.0165, 0.275, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LT203', false, NULL, NULL,
    'marginal', 'marginal',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0147, 0.0147, 0.0147, 0.245, 0.0147, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.5, 1.5, 1.5163, 1.5163, 0.0163, 0.2712, 0.0163, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 3.0, 3.0, 3.0179, 3.0179, 0.0178, 0.2975, 0.0178, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 4.5, 4.5, 4.5194, 4.5194, 0.0194, 0.3237, 0.0194, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 6.0, 6.0, 6.021, 6.021, 0.021, 0.35, 0.021, 0.35, 'pass', 'pass');

  -- LT-204: Sludge Sump Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-204' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-204 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-23', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-LT204', false,
    'pass', 'pass',
    0.201, 0.181,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.006, 0.006, 0.006, 0.2006, 0.006, 0.2006, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.756, 0.756, 0.006, 0.2006, 0.006, 0.2006, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.506, 1.506, 0.006, 0.2006, 0.006, 0.2006, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.256, 2.256, 0.006, 0.2006, 0.006, 0.2006, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.006, 3.006, 0.006, 0.2006, 0.006, 0.2006, 'pass', 'pass');

  -- FT-201: Settled Water Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-07', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-FT201', false,
    'pass', 'pass',
    0.284, 0.255,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 14.1756, 14.1756, 14.1756, 0.2835, 14.1756, 0.2835, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1250.0, 1250.0, 1264.1756, 1264.1756, 14.1756, 0.2835, 14.1756, 0.2835, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2500.0, 2500.0, 2514.1756, 2514.1756, 14.1756, 0.2835, 14.1756, 0.2835, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3750.0, 3750.0, 3764.1756, 3764.1756, 14.1756, 0.2835, 14.1756, 0.2835, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5000.0, 5000.0, 5014.1756, 5014.1756, 14.1756, 0.2835, 14.1756, 0.2835, 'pass', 'pass');

  -- FT-202: Sludge Withdrawal Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-24', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-FT202', false,
    'pass', 'pass',
    0.181, 0.163,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3615, 0.3615, 0.3615, 0.1807, 0.3615, 0.1807, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3615, 50.3615, 0.3615, 0.1807, 0.3615, 0.1807, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3615, 100.3615, 0.3615, 0.1807, 0.3615, 0.1807, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.3615, 150.3615, 0.3615, 0.1807, 0.3615, 0.1807, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.3615, 200.3615, 0.3615, 0.1807, 0.3615, 0.1807, 'pass', 'pass');

  -- FT-203: Alum Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-03', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-FT203', false, NULL, NULL,
    'pass', 'pass',
    0.161, 0.161,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.8068, 0.8068, 0.8068, 0.1614, 0.8068, 0.1614, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 125.8068, 125.8068, 0.8068, 0.1614, 0.8068, 0.1614, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 250.8068, 250.8068, 0.8068, 0.1614, 0.8068, 0.1614, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 375.8068, 375.8068, 0.8068, 0.1614, 0.8068, 0.1614, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 500.8068, 500.8068, 0.8068, 0.1614, 0.8068, 0.1614, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-23', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-FT203', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 6.5, 0.325, 6.5, 1.3, 0.325, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 131.5, 125.325, 6.5, 1.3, 0.325, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 256.5, 250.325, 6.5, 1.3, 0.325, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 381.5, 375.325, 6.5, 1.3, 0.325, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 506.5, 500.325, 6.5, 1.3, 0.325, 0.065, 'fail', 'pass');

  -- FT-204: Lime Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-204' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-204 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-FT204', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.07, 0.07, 0.07, 0.035, 0.07, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.0775, 50.0775, 0.0775, 0.0387, 0.0775, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.085, 100.085, 0.085, 0.0425, 0.085, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.0925, 150.0925, 0.0925, 0.0462, 0.0925, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.1, 200.1, 0.1, 0.05, 0.1, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-FT204', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.28, 0.28, 0.28, 0.14, 0.28, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.31, 50.31, 0.31, 0.155, 0.31, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.34, 100.34, 0.34, 0.17, 0.34, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.37, 150.37, 0.37, 0.185, 0.37, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.4, 200.4, 0.4, 0.2, 0.4, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-FT204', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.49, 0.49, 0.49, 0.245, 0.49, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.5425, 50.5425, 0.5425, 0.2712, 0.5425, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.595, 100.595, 0.595, 0.2975, 0.595, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.6475, 150.6475, 0.6475, 0.3237, 0.6475, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.7, 200.7, 0.7, 0.35, 0.7, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-FT204', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7, 0.7, 0.7, 0.35, 0.7, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.775, 50.775, 0.775, 0.3875, 0.775, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.85, 100.85, 0.85, 0.425, 0.85, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.925, 150.925, 0.925, 0.4625, 0.925, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 201.0, 201.0, 1.0, 0.5, 1.0, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-FT204', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.91, 0.91, 0.91, 0.455, 0.91, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 51.0075, 51.0075, 1.0075, 0.5037, 1.0075, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 101.105, 101.105, 1.105, 0.5525, 1.105, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 151.2025, 151.2025, 1.2025, 0.6012, 1.2025, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 201.3, 201.3, 1.3, 0.65, 1.3, 0.65, 'pass', 'pass');

  -- FT-205: Polymer Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-205' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-205 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-09', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-FT205', false,
    'pass', 'pass',
    0.738, 0.664,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3688, 0.3688, 0.3688, 0.7377, 0.3688, 0.7377, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 12.5, 12.5, 12.8688, 12.8688, 0.3688, 0.7377, 0.3688, 0.7377, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 25.0, 25.0, 25.3688, 25.3688, 0.3688, 0.7377, 0.3688, 0.7377, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 37.5, 37.5, 37.8688, 37.8688, 0.3688, 0.7377, 0.3688, 0.7377, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 50.0, 50.0, 50.3688, 50.3688, 0.3688, 0.7377, 0.3688, 0.7377, 'pass', 'pass');

  -- TT-201: Settled Water Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-TT201', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.014, 0.014, 0.014, 0.035, 0.014, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.0155, 10.0155, 0.0155, 0.0387, 0.0155, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.017, 20.017, 0.017, 0.0425, 0.017, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.0185, 30.0185, 0.0185, 0.0462, 0.0185, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.02, 40.02, 0.02, 0.05, 0.02, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-15', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-TT201', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.056, 0.056, 0.056, 0.14, 0.056, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.062, 10.062, 0.062, 0.155, 0.062, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.068, 20.068, 0.068, 0.17, 0.068, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.074, 30.074, 0.074, 0.185, 0.074, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.08, 40.08, 0.08, 0.2, 0.08, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-TT201', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.098, 0.098, 0.098, 0.245, 0.098, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.1085, 10.1085, 0.1085, 0.2712, 0.1085, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.119, 20.119, 0.119, 0.2975, 0.119, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.1295, 30.1295, 0.1295, 0.3237, 0.1295, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.14, 40.14, 0.14, 0.35, 0.14, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-TT201', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.14, 0.14, 0.14, 0.35, 0.14, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.155, 10.155, 0.155, 0.3875, 0.155, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.17, 20.17, 0.17, 0.425, 0.17, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.185, 30.185, 0.185, 0.4625, 0.185, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.2, 40.2, 0.2, 0.5, 0.2, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-TT201', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.182, 0.182, 0.182, 0.455, 0.182, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.2015, 10.2015, 0.2015, 0.5037, 0.2015, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.221, 20.221, 0.221, 0.5525, 0.221, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.2405, 30.2405, 0.2405, 0.6012, 0.2405, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.26, 40.26, 0.26, 0.65, 0.26, 0.65, 'pass', 'pass');

  -- TT-202: Sludge Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-09', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-TT202', false,
    'pass', 'pass',
    0.268, 0.241,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.1073, 0.1073, 0.1073, 0.2682, 0.1073, 0.2682, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.1073, 10.1073, 0.1073, 0.2682, 0.1073, 0.2682, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.1073, 20.1073, 0.1073, 0.2682, 0.1073, 0.2682, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.1073, 30.1073, 0.1073, 0.2682, 0.1073, 0.2682, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.1073, 40.1073, 0.1073, 0.2682, 0.1073, 0.2682, 'pass', 'pass');

  -- AT-201: Settled Water Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-12', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT201', false, NULL, NULL,
    'pass', 'pass',
    0.126, 0.126,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0126, 0.0126, 0.0126, 0.1258, 0.0126, 0.1258, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5126, 2.5126, 0.0126, 0.1258, 0.0126, 0.1258, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0126, 5.0126, 0.0126, 0.1258, 0.0126, 0.1258, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5126, 7.5126, 0.0126, 0.1258, 0.0126, 0.1258, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0126, 10.0126, 0.0126, 0.1258, 0.0126, 0.1258, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-04', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-AT201', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.13, 0.0065, 0.13, 1.3, 0.0065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.63, 2.5065, 0.13, 1.3, 0.0065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.13, 5.0065, 0.13, 1.3, 0.0065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.63, 7.5065, 0.13, 1.3, 0.0065, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.13, 10.0065, 0.13, 1.3, 0.0065, 0.065, 'fail', 'pass');

  -- AT-202: Settled Water pH
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-08', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT202', false, NULL, NULL,
    'pass', 'pass',
    0.064, 0.064,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0038, 4.0038, 0.0038, 0.0638, 0.0038, 0.0638, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5038, 5.5038, 0.0038, 0.0638, 0.0038, 0.0638, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0038, 7.0038, 0.0038, 0.0638, 0.0038, 0.0638, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5038, 8.5038, 0.0038, 0.0638, 0.0038, 0.0638, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0038, 10.0038, 0.0038, 0.0638, 0.0038, 0.0638, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-22', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-AT202', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.078, 4.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.578, 5.5039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.078, 7.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.578, 8.5039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.078, 10.0039, 0.078, 1.3, 0.0039, 0.065, 'fail', 'pass');

  -- AT-203: Alum Concentration
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-22', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT203', false,
    'pass', 'pass',
    0.082, 0.073,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0816, 0.0816, 0.0816, 0.0816, 0.0816, 0.0816, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.0816, 25.0816, 0.0816, 0.0816, 0.0816, 0.0816, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.0816, 50.0816, 0.0816, 0.0816, 0.0816, 0.0816, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.0816, 75.0816, 0.0816, 0.0816, 0.0816, 0.0816, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.0816, 100.0816, 0.0816, 0.0816, 0.0816, 0.0816, 'pass', 'pass');

  -- AT-204: Coagulation Zeta Potential
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-204' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-204 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT204', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, -60.0, -60.0, -59.958, -59.958, 0.042, 0.035, 0.042, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, -30.0, -30.0, -29.9535, -29.9535, 0.0465, 0.0387, 0.0465, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.0, 0.0, 0.051, 0.051, 0.051, 0.0425, 0.051, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.0555, 30.0555, 0.0555, 0.0462, 0.0555, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 60.0, 60.0, 60.06, 60.06, 0.06, 0.05, 0.06, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-AT204', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, -60.0, -60.0, -59.706, -59.706, 0.294, 0.245, 0.294, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, -30.0, -30.0, -29.6745, -29.6745, 0.3255, 0.2712, 0.3255, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.0, 0.0, 0.357, 0.357, 0.357, 0.2975, 0.357, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.3885, 30.3885, 0.3885, 0.3237, 0.3885, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 60.0, 60.0, 60.42, 60.42, 0.42, 0.35, 0.42, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-AT204', false, NULL, NULL,
    'pass', 'pass',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, -60.0, -60.0, -59.454, -59.454, 0.546, 0.455, 0.546, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, -30.0, -30.0, -29.3955, -29.3955, 0.6045, 0.5037, 0.6045, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.0, 0.0, 0.663, 0.663, 0.663, 0.5525, 0.663, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.7215, 30.7215, 0.7215, 0.6012, 0.7215, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 60.0, 60.0, 60.78, 60.78, 0.78, 0.65, 0.78, 0.65, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-AT204', false, NULL, NULL,
    'marginal', 'marginal',
    0.95, 0.855,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, -60.0, -60.0, -59.202, -59.202, 0.798, 0.665, 0.798, 0.665, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, -30.0, -30.0, -29.1165, -29.1165, 0.8835, 0.7362, 0.8835, 0.7362, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.0, 0.0, 0.969, 0.969, 0.969, 0.8075, 0.969, 0.8075, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 31.0545, 31.0545, 1.0545, 0.8787, 1.0545, 0.8787, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 60.0, 60.0, 61.14, 61.14, 1.14, 0.95, 1.14, 0.95, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT204', false, NULL, NULL,
    'marginal', 'marginal',
    1.25, 1.125,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, -60.0, -60.0, -58.95, -58.95, 1.05, 0.875, 1.05, 0.875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, -30.0, -30.0, -28.8375, -28.8375, 1.1625, 0.9687, 1.1625, 0.9687, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.0, 0.0, 1.275, 1.275, 1.275, 1.0625, 1.275, 1.0625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 31.3875, 31.3875, 1.3875, 1.1562, 1.3875, 1.1562, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 60.0, 60.0, 61.5, 61.5, 1.5, 1.25, 1.5, 1.25, 'pass', 'pass');

  -- SV-201: Settled Water Control Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-14', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-SV201', false,
    'pass', 'pass',
    0.47, 0.423,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4695, 0.4695, 0.4695, 0.4695, 0.4695, 0.4695, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.4695, 50.4695, 0.4695, 0.4695, 0.4695, 0.4695, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.4695, 100.4695, 0.4695, 0.4695, 0.4695, 0.4695, 'pass', 'pass');

  -- SV-202: Sludge Drain Valve Position
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-19', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-SV202', false,
    'pass', 'pass',
    0.219, 0.197,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2191, 0.2191, 0.2191, 0.2191, 0.2191, 0.2191, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.2191, 50.2191, 0.2191, 0.2191, 0.2191, 0.2191, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.2191, 100.2191, 0.2191, 0.2191, 0.2191, 0.2191, 'pass', 'pass');

  -- SV-203: Alum Dosing Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-10', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-SV203', false,
    'pass', 'pass',
    0.344, 0.31,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3445, 0.3445, 0.3445, 0.3445, 0.3445, 0.3445, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3445, 50.3445, 0.3445, 0.3445, 0.3445, 0.3445, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3445, 100.3445, 0.3445, 0.3445, 0.3445, 0.3445, 'pass', 'pass');

  -- PS-201: Sedimentation Overflow Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-27', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-PS201', false,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0035, 0.0035, 0.0035, 0.3497, 0.0035, 0.3497, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5035, 0.5035, 0.0035, 0.3497, 0.0035, 0.3497, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0035, 1.0035, 0.0035, 0.3497, 0.0035, 0.3497, 'pass', 'pass');

  -- LS-201: Sludge Sump High Level Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LS-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LS-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-05', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-LS201', false,
    'pass', 'pass',
    0.073, 0.066,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0007, 0.0007, 0.0007, 0.0729, 0.0007, 0.0729, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5007, 0.5007, 0.0007, 0.0729, 0.0007, 0.0729, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0007, 1.0007, 0.0007, 0.0729, 0.0007, 0.0729, 'pass', 'pass');

  -- LS-202: Settled Water Tank High Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LS-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LS-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-28', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LS202', false, NULL, NULL,
    'pass', 'pass',
    0.132, 0.132,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0013, 0.0013, 0.0013, 0.1318, 0.0013, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5013, 0.5013, 0.0013, 0.1318, 0.0013, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0013, 1.0013, 0.0013, 0.1318, 0.0013, 0.1318, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-13', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-LS202', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');

  -- PT-202: Flocculation Mix Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-202' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-202 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-08', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-PT202', false,
    'pass', 'pass',
    0.345, 0.31,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3449, 0.3449, 0.3449, 0.3449, 0.3449, 0.3449, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.3449, 25.3449, 0.3449, 0.3449, 0.3449, 0.3449, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.3449, 50.3449, 0.3449, 0.3449, 0.3449, 0.3449, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.3449, 75.3449, 0.3449, 0.3449, 0.3449, 0.3449, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.3449, 100.3449, 0.3449, 0.3449, 0.3449, 0.3449, 'pass', 'pass');

  -- PT-203: Sedimentation Inlet Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-24', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-PT203', false,
    'pass', 'pass',
    0.063, 0.056,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.1882, 0.1882, 0.1882, 0.0627, 0.1882, 0.0627, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 75.0, 75.0, 75.1882, 75.1882, 0.1882, 0.0627, 0.1882, 0.0627, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 150.0, 150.0, 150.1882, 150.1882, 0.1882, 0.0627, 0.1882, 0.0627, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 225.0, 225.0, 225.1882, 225.1882, 0.1882, 0.0627, 0.1882, 0.0627, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 300.0, 300.0, 300.1882, 300.1882, 0.1882, 0.0627, 0.1882, 0.0627, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-03-29', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-PT203', false,
    'pass', 'pass',
    0.105, 0.094,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3141, 0.3141, 0.3141, 0.1047, 0.3141, 0.1047, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 75.0, 75.0, 75.3141, 75.3141, 0.3141, 0.1047, 0.3141, 0.1047, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 150.0, 150.0, 150.3141, 150.3141, 0.3141, 0.1047, 0.3141, 0.1047, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 225.0, 225.0, 225.3141, 225.3141, 0.3141, 0.1047, 0.3141, 0.1047, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 300.0, 300.0, 300.3141, 300.3141, 0.3141, 0.1047, 0.3141, 0.1047, 'pass', 'pass');

  -- FT-206: Recycle Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-206' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-206 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-03-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-FT206', false,
    'pass', 'pass',
    0.14, 0.126,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.6995, 0.6995, 0.6995, 0.1399, 0.6995, 0.1399, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 125.6995, 125.6995, 0.6995, 0.1399, 0.6995, 0.1399, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 250.6995, 250.6995, 0.6995, 0.1399, 0.6995, 0.1399, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 375.6995, 375.6995, 0.6995, 0.1399, 0.6995, 0.1399, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 500.6995, 500.6995, 0.6995, 0.1399, 0.6995, 0.1399, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-04-01', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-FT206', false,
    'pass', 'pass',
    0.152, 0.137,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7616, 0.7616, 0.7616, 0.1523, 0.7616, 0.1523, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 125.7616, 125.7616, 0.7616, 0.1523, 0.7616, 0.1523, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 250.7616, 250.7616, 0.7616, 0.1523, 0.7616, 0.1523, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 375.7616, 375.7616, 0.7616, 0.1523, 0.7616, 0.1523, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 500.7616, 500.7616, 0.7616, 0.1523, 0.7616, 0.1523, 'pass', 'pass');

  -- AT-205: Settled Water Alkalinity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-205' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-205 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-07', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-AT205', false,
    'pass', 'pass',
    0.444, 0.399,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.8876, 0.8876, 0.8876, 0.4438, 0.8876, 0.4438, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.8876, 50.8876, 0.8876, 0.4438, 0.8876, 0.4438, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.8876, 100.8876, 0.8876, 0.4438, 0.8876, 0.4438, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.8876, 150.8876, 0.8876, 0.4438, 0.8876, 0.4438, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.8876, 200.8876, 0.8876, 0.4438, 0.8876, 0.4438, 'pass', 'pass');

  -- TT-203: Flocculation Tank Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-203' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-203 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-20', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-TT203', false,
    'pass', 'pass',
    1.064, 0.958,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4258, 0.4258, 0.4258, 1.0644, 0.4258, 1.0644, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.4258, 10.4258, 0.4258, 1.0644, 0.4258, 1.0644, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.4258, 20.4258, 0.4258, 1.0644, 0.4258, 1.0644, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.4258, 30.4258, 0.4258, 1.0644, 0.4258, 1.0644, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.4258, 40.4258, 0.4258, 1.0644, 0.4258, 1.0644, 'pass', 'pass');

  -- LT-205: Settled Water Storage Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-205' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-205 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-19', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-LT205', false,
    'pass', 'pass',
    0.293, 0.264,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0234, 0.0234, 0.0234, 0.2929, 0.0234, 0.2929, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.0, 2.0, 2.0234, 2.0234, 0.0234, 0.2929, 0.0234, 0.2929, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 4.0, 4.0, 4.0234, 4.0234, 0.0234, 0.2929, 0.0234, 0.2929, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 6.0, 6.0, 6.0234, 6.0234, 0.0234, 0.2929, 0.0234, 0.2929, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 8.0, 8.0, 8.0234, 8.0234, 0.0234, 0.2929, 0.0234, 0.2929, 'pass', 'pass');

  -- FT-207: Backwash Water Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-207' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-207 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-22', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-FT207', false,
    'pass', 'pass',
    0.28, 0.252,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 5.5991, 5.5991, 5.5991, 0.28, 5.5991, 0.28, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 505.5991, 505.5991, 5.5991, 0.28, 5.5991, 0.28, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1005.5991, 1005.5991, 5.5991, 0.28, 5.5991, 0.28, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1505.5991, 1505.5991, 5.5991, 0.28, 5.5991, 0.28, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2005.5991, 2005.5991, 5.5991, 0.28, 5.5991, 0.28, 'pass', 'pass');

  -- PT-204: Backwash Header Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-204' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-204 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-01', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-PT204', false,
    'pass', 'pass',
    0.263, 0.237,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.0538, 1.0538, 1.0538, 0.2634, 1.0538, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 100.0, 100.0, 101.0538, 101.0538, 1.0538, 0.2634, 1.0538, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 200.0, 200.0, 201.0538, 201.0538, 1.0538, 0.2634, 1.0538, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 300.0, 300.0, 301.0538, 301.0538, 1.0538, 0.2634, 1.0538, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 400.0, 400.0, 401.0538, 401.0538, 1.0538, 0.2634, 1.0538, 0.2634, 'pass', 'pass');

  -- AT-206: Settled Water TOC
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-206' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-206 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-16', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-AT206', false,
    'pass', 'pass',
    1.061, 0.955,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2123, 0.2123, 0.2123, 1.0613, 0.2123, 1.0613, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.0, 5.0, 5.2123, 5.2123, 0.2123, 1.0613, 0.2123, 1.0613, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 10.0, 10.0, 10.2123, 10.2123, 0.2123, 1.0613, 0.2123, 1.0613, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 15.0, 15.0, 15.2123, 15.2123, 0.2123, 1.0613, 0.2123, 1.0613, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 20.0, 20.0, 20.2123, 20.2123, 0.2123, 1.0613, 0.2123, 1.0613, 'pass', 'pass');

  -- AT-207: Coag Dose Controller pH
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-207' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-207 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-30', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-TRE-AT207', false,
    'pass', 'pass',
    0.132, 0.119,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0079, 4.0079, 0.0079, 0.1322, 0.0079, 0.1322, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5079, 5.5079, 0.0079, 0.1322, 0.0079, 0.1322, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0079, 7.0079, 0.0079, 0.1322, 0.0079, 0.1322, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5079, 8.5079, 0.0079, 0.1322, 0.0079, 0.1322, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0079, 10.0079, 0.0079, 0.1322, 0.0079, 0.1322, 'pass', 'pass');

  -- FS-201: Backwash Pump Flow Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FS-201' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FS-201 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-07', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-TRE-FS201', false,
    'pass', 'pass',
    0.476, 0.428,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0048, 0.0048, 0.0048, 0.476, 0.0048, 0.476, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5048, 0.5048, 0.0048, 0.476, 0.0048, 0.476, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0048, 1.0048, 0.0048, 0.476, 0.0048, 0.476, 'pass', 'pass');

  -- PT-205: Lamella Plate DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-205' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-205 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-04', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-TRE-PT205', false,
    'pass', 'pass',
    0.487, 0.439,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2436, 0.2436, 0.2436, 0.4873, 0.2436, 0.4873, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 12.5, 12.5, 12.7436, 12.7436, 0.2436, 0.4873, 0.2436, 0.4873, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 25.0, 25.0, 25.2436, 25.2436, 0.2436, 0.4873, 0.2436, 0.4873, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 37.5, 37.5, 37.7436, 37.7436, 0.2436, 0.4873, 0.2436, 0.4873, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 50.0, 50.0, 50.2436, 50.2436, 0.2436, 0.4873, 0.2436, 0.4873, 'pass', 'pass');

  -- LT-206: Chemical Day Tank Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-206' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-206 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-26', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LT206', false,
    'pass', 'pass',
    0.342, 0.308,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0068, 0.0068, 0.0068, 0.3422, 0.0068, 0.3422, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5068, 0.5068, 0.0068, 0.3422, 0.0068, 0.3422, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0068, 1.0068, 0.0068, 0.3422, 0.0068, 0.3422, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5068, 1.5068, 0.0068, 0.3422, 0.0068, 0.3422, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0068, 2.0068, 0.0068, 0.3422, 0.0068, 0.3422, 'pass', 'pass');

  -- PT-301: Filter 1 Inlet Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-06', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PT301', false,
    'pass', 'pass',
    0.133, 0.12,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.5331, 0.5331, 0.5331, 0.1333, 0.5331, 0.1333, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 100.0, 100.0, 100.5331, 100.5331, 0.5331, 0.1333, 0.5331, 0.1333, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 200.0, 200.0, 200.5331, 200.5331, 0.5331, 0.1333, 0.5331, 0.1333, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 300.0, 300.0, 300.5331, 300.5331, 0.5331, 0.1333, 0.5331, 0.1333, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 400.0, 400.0, 400.5331, 400.5331, 0.5331, 0.1333, 0.5331, 0.1333, 'pass', 'pass');

  -- PT-302: Filter 2 Inlet Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-24', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-PT302', false,
    'pass', 'pass',
    0.262, 0.236,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.0473, 1.0473, 1.0473, 0.2618, 1.0473, 0.2618, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 100.0, 100.0, 101.0473, 101.0473, 1.0473, 0.2618, 1.0473, 0.2618, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 200.0, 200.0, 201.0473, 201.0473, 1.0473, 0.2618, 1.0473, 0.2618, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 300.0, 300.0, 301.0473, 301.0473, 1.0473, 0.2618, 1.0473, 0.2618, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 400.0, 400.0, 401.0473, 401.0473, 1.0473, 0.2618, 1.0473, 0.2618, 'pass', 'pass');

  -- PT-303: Filter 1 DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-303' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-303 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT303', false, NULL, NULL,
    'pass', 'pass',
    0.08, 0.08,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0639, 0.0639, 0.0639, 0.0799, 0.0639, 0.0799, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.0639, 20.0639, 0.0639, 0.0799, 0.0639, 0.0799, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.0639, 40.0639, 0.0639, 0.0799, 0.0639, 0.0799, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.0639, 60.0639, 0.0639, 0.0799, 0.0639, 0.0799, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.0639, 80.0639, 0.0639, 0.0799, 0.0639, 0.0799, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-11', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PT303', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.52, 0.026, 0.52, 0.65, 0.026, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.52, 20.026, 0.52, 0.65, 0.026, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.52, 40.026, 0.52, 0.65, 0.026, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.52, 60.026, 0.52, 0.65, 0.026, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.52, 80.026, 0.52, 0.65, 0.026, 0.0325, 'fail', 'pass');

  -- PT-304: Filter 2 DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-304' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-304 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-03', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT304', false,
    'pass', 'pass',
    0.112, 0.101,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0899, 0.0899, 0.0899, 0.1124, 0.0899, 0.1124, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.0899, 20.0899, 0.0899, 0.1124, 0.0899, 0.1124, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.0899, 40.0899, 0.0899, 0.1124, 0.0899, 0.1124, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.0899, 60.0899, 0.0899, 0.1124, 0.0899, 0.1124, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.0899, 80.0899, 0.0899, 0.1124, 0.0899, 0.1124, 'pass', 'pass');

  -- PT-305: Filter 3 DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-305' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-305 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT305', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.028, 0.028, 0.028, 0.035, 0.028, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.031, 20.031, 0.031, 0.0387, 0.031, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.034, 40.034, 0.034, 0.0425, 0.034, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.037, 60.037, 0.037, 0.0462, 0.037, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.04, 80.04, 0.04, 0.05, 0.04, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-15', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PT305', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.112, 0.112, 0.112, 0.14, 0.112, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.124, 20.124, 0.124, 0.155, 0.124, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.136, 40.136, 0.136, 0.17, 0.136, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.148, 60.148, 0.148, 0.185, 0.148, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.16, 80.16, 0.16, 0.2, 0.16, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-PT305', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.196, 0.196, 0.196, 0.245, 0.196, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.217, 20.217, 0.217, 0.2712, 0.217, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.238, 40.238, 0.238, 0.2975, 0.238, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.259, 60.259, 0.259, 0.3237, 0.259, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.28, 80.28, 0.28, 0.35, 0.28, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-PT305', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.28, 0.28, 0.28, 0.35, 0.28, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.31, 20.31, 0.31, 0.3875, 0.31, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.34, 40.34, 0.34, 0.425, 0.34, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.37, 60.37, 0.37, 0.4625, 0.37, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.4, 80.4, 0.4, 0.5, 0.4, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT305', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.364, 0.364, 0.364, 0.455, 0.364, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.403, 20.403, 0.403, 0.5037, 0.403, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.442, 40.442, 0.442, 0.5525, 0.442, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.481, 60.481, 0.481, 0.6012, 0.481, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.52, 80.52, 0.52, 0.65, 0.52, 0.65, 'pass', 'pass');

  -- FT-301: Filter 1 Effluent Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-03', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-FT301', false,
    'pass', 'pass',
    0.09, 0.081,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.3528, 1.3528, 1.3528, 0.0902, 1.3528, 0.0902, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 376.3528, 376.3528, 1.3528, 0.0902, 1.3528, 0.0902, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 751.3528, 751.3528, 1.3528, 0.0902, 1.3528, 0.0902, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1126.3528, 1126.3528, 1.3528, 0.0902, 1.3528, 0.0902, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1501.3528, 1501.3528, 1.3528, 0.0902, 1.3528, 0.0902, 'pass', 'pass');

  -- FT-302: Filter 2 Effluent Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-12', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-FT302', false,
    'pass', 'pass',
    0.138, 0.124,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 2.0638, 2.0638, 2.0638, 0.1376, 2.0638, 0.1376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 377.0638, 377.0638, 2.0638, 0.1376, 2.0638, 0.1376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 752.0638, 752.0638, 2.0638, 0.1376, 2.0638, 0.1376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1127.0638, 1127.0638, 2.0638, 0.1376, 2.0638, 0.1376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1502.0638, 1502.0638, 2.0638, 0.1376, 2.0638, 0.1376, 'pass', 'pass');

  -- FT-303: Filter 3 Effluent Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-303' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-303 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-FT303', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.525, 0.525, 0.525, 0.035, 0.525, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 375.5813, 375.5813, 0.5812, 0.0387, 0.5812, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 750.6375, 750.6375, 0.6375, 0.0425, 0.6375, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1125.6937, 1125.6937, 0.6937, 0.0462, 0.6937, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1500.75, 1500.75, 0.75, 0.05, 0.75, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-15', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-FT303', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 2.1, 2.1, 2.1, 0.14, 2.1, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 377.325, 377.325, 2.325, 0.155, 2.325, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 752.55, 752.55, 2.55, 0.17, 2.55, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1127.775, 1127.775, 2.775, 0.185, 2.775, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1503.0, 1503.0, 3.0, 0.2, 3.0, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-FT303', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 3.675, 3.675, 3.675, 0.245, 3.675, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 379.0688, 379.0688, 4.0687, 0.2712, 4.0687, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 754.4625, 754.4625, 4.4625, 0.2975, 4.4625, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1129.8563, 1129.8563, 4.8562, 0.3237, 4.8562, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1505.25, 1505.25, 5.25, 0.35, 5.25, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-FT303', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 5.25, 5.25, 5.25, 0.35, 5.25, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 380.8125, 380.8125, 5.8125, 0.3875, 5.8125, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 756.375, 756.375, 6.375, 0.425, 6.375, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1131.9375, 1131.9375, 6.9375, 0.4625, 6.9375, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1507.5, 1507.5, 7.5, 0.5, 7.5, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-FT303', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 6.825, 6.825, 6.825, 0.455, 6.825, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 382.5562, 382.5562, 7.5562, 0.5037, 7.5562, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 758.2875, 758.2875, 8.2875, 0.5525, 8.2875, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1134.0187, 1134.0187, 9.0187, 0.6012, 9.0187, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1509.75, 1509.75, 9.75, 0.65, 9.75, 0.65, 'pass', 'pass');

  -- FT-304: Filter Backwash Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-304' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-304 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-FT304', false,
    'pass', 'pass',
    0.263, 0.237,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 7.9013, 7.9013, 7.9013, 0.2634, 7.9013, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 750.0, 750.0, 757.9013, 757.9013, 7.9013, 0.2634, 7.9013, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1500.0, 1500.0, 1507.9013, 1507.9013, 7.9013, 0.2634, 7.9013, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2250.0, 2250.0, 2257.9013, 2257.9013, 7.9013, 0.2634, 7.9013, 0.2634, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3000.0, 3000.0, 3007.9013, 3007.9013, 7.9013, 0.2634, 7.9013, 0.2634, 'pass', 'pass');

  -- LT-301: Filter 1 Water Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-21', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-LT301', false,
    'pass', 'pass',
    0.125, 0.112,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0037, 0.0037, 0.0037, 0.1248, 0.0037, 0.1248, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7537, 0.7537, 0.0037, 0.1248, 0.0037, 0.1248, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5037, 1.5037, 0.0037, 0.1248, 0.0037, 0.1248, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2537, 2.2537, 0.0037, 0.1248, 0.0037, 0.1248, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0037, 3.0037, 0.0037, 0.1248, 0.0037, 0.1248, 'pass', 'pass');

  -- LT-302: Filter 2 Water Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-23', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-LT302', false,
    'pass', 'pass',
    0.138, 0.124,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0041, 0.0041, 0.0041, 0.1379, 0.0041, 0.1379, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7541, 0.7541, 0.0041, 0.1379, 0.0041, 0.1379, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5041, 1.5041, 0.0041, 0.1379, 0.0041, 0.1379, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2541, 2.2541, 0.0041, 0.1379, 0.0041, 0.1379, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0041, 3.0041, 0.0041, 0.1379, 0.0041, 0.1379, 'pass', 'pass');

  -- LT-303: Filter 3 Water Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-303' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-303 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-02', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-LT303', false,
    'pass', 'pass',
    0.219, 0.197,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0066, 0.0066, 0.0066, 0.2188, 0.0066, 0.2188, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7566, 0.7566, 0.0066, 0.2188, 0.0066, 0.2188, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5066, 1.5066, 0.0066, 0.2188, 0.0066, 0.2188, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2566, 2.2566, 0.0066, 0.2188, 0.0066, 0.2188, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0066, 3.0066, 0.0066, 0.2188, 0.0066, 0.2188, 'pass', 'pass');

  -- LT-304: Filtered Water Tank Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-304' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-304 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-26', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-LT304', false,
    'pass', 'pass',
    0.061, 0.055,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0049, 0.0049, 0.0049, 0.0611, 0.0049, 0.0611, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.0, 2.0, 2.0049, 2.0049, 0.0049, 0.0611, 0.0049, 0.0611, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 4.0, 4.0, 4.0049, 4.0049, 0.0049, 0.0611, 0.0049, 0.0611, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 6.0, 6.0, 6.0049, 6.0049, 0.0049, 0.0611, 0.0049, 0.0611, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 8.0, 8.0, 8.0049, 8.0049, 0.0049, 0.0611, 0.0049, 0.0611, 'pass', 'pass');

  -- TT-301: Filtered Water Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-20', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-TT301', false,
    'pass', 'pass',
    0.132, 0.119,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0527, 0.0527, 0.0527, 0.1318, 0.0527, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.0527, 10.0527, 0.0527, 0.1318, 0.0527, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.0527, 20.0527, 0.0527, 0.1318, 0.0527, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.0527, 30.0527, 0.0527, 0.1318, 0.0527, 0.1318, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.0527, 40.0527, 0.0527, 0.1318, 0.0527, 0.1318, 'pass', 'pass');

  -- AT-301: Filter 1 Effluent Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-12', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT301', false, NULL, NULL,
    'pass', 'pass',
    0.056, 0.056,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0011, 0.0011, 0.0011, 0.0557, 0.0011, 0.0557, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5011, 0.5011, 0.0011, 0.0557, 0.0011, 0.0557, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0011, 1.0011, 0.0011, 0.0557, 0.0011, 0.0557, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5011, 1.5011, 0.0011, 0.0557, 0.0011, 0.0557, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0011, 2.0011, 0.0011, 0.0557, 0.0011, 0.0557, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-28', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT301', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.513, 1.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.013, 2.0006, 0.013, 0.65, 0.0006, 0.0325, 'fail', 'pass');

  -- AT-302: Filter 2 Effluent Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-01', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT302', false, NULL, NULL,
    'pass', 'pass',
    0.159, 0.159,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0032, 0.0032, 0.0032, 0.1593, 0.0032, 0.1593, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5032, 0.5032, 0.0032, 0.1593, 0.0032, 0.1593, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0032, 1.0032, 0.0032, 0.1593, 0.0032, 0.1593, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5032, 1.5032, 0.0032, 0.1593, 0.0032, 0.1593, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0032, 2.0032, 0.0032, 0.1593, 0.0032, 0.1593, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-16', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT302', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.513, 1.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.013, 2.0006, 0.013, 0.65, 0.0006, 0.0325, 'fail', 'pass');

  -- AT-303: Filter 3 Effluent Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-303' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-303 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-27', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT303', false,
    'pass', 'pass',
    0.096, 0.086,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0019, 0.0019, 0.0019, 0.0959, 0.0019, 0.0959, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5019, 0.5019, 0.0019, 0.0959, 0.0019, 0.0959, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0019, 1.0019, 0.0019, 0.0959, 0.0019, 0.0959, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5019, 1.5019, 0.0019, 0.0959, 0.0019, 0.0959, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0019, 2.0019, 0.0019, 0.0959, 0.0019, 0.0959, 'pass', 'pass');

  -- AT-304: Combined Filter Effluent Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-304' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-304 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-03', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT304', false, NULL, NULL,
    'pass', 'pass',
    0.079, 0.079,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0016, 0.0016, 0.0016, 0.0785, 0.0016, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5016, 0.5016, 0.0016, 0.0785, 0.0016, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0016, 1.0016, 0.0016, 0.0785, 0.0016, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5016, 1.5016, 0.0016, 0.0785, 0.0016, 0.0785, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0016, 2.0016, 0.0016, 0.0785, 0.0016, 0.0785, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-12', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT304', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.513, 1.5007, 0.013, 0.65, 0.0007, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.013, 2.0006, 0.013, 0.65, 0.0006, 0.0325, 'fail', 'pass');

  -- AT-305: Filter Effluent pH
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-305' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-305 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-23', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT305', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0021, 4.0021, 0.0021, 0.035, 0.0021, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5023, 5.5023, 0.0023, 0.0387, 0.0023, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0026, 7.0026, 0.0026, 0.0425, 0.0026, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5028, 8.5028, 0.0028, 0.0462, 0.0028, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.003, 10.003, 0.003, 0.05, 0.003, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT305', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0084, 4.0084, 0.0084, 0.14, 0.0084, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5093, 5.5093, 0.0093, 0.155, 0.0093, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0102, 7.0102, 0.0102, 0.17, 0.0102, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5111, 8.5111, 0.0111, 0.185, 0.0111, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.012, 10.012, 0.012, 0.2, 0.012, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-18', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-AT305', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0147, 4.0147, 0.0147, 0.245, 0.0147, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5163, 5.5163, 0.0163, 0.2712, 0.0163, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0179, 7.0179, 0.0178, 0.2975, 0.0178, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5194, 8.5194, 0.0194, 0.3237, 0.0194, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.021, 10.021, 0.021, 0.35, 0.021, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-15', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-AT305', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.021, 4.021, 0.021, 0.35, 0.021, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5232, 5.5232, 0.0232, 0.3875, 0.0232, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0255, 7.0255, 0.0255, 0.425, 0.0255, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5277, 8.5277, 0.0277, 0.4625, 0.0277, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.03, 10.03, 0.03, 0.5, 0.03, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-15', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT305', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0273, 4.0273, 0.0273, 0.455, 0.0273, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5302, 5.5302, 0.0302, 0.5038, 0.0302, 0.5038, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0332, 7.0332, 0.0332, 0.5525, 0.0332, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5361, 8.5361, 0.0361, 0.6013, 0.0361, 0.6013, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.039, 10.039, 0.039, 0.65, 0.039, 0.65, 'pass', 'pass');

  -- SV-301: Filter 1 Inlet Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-24', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-SV301', false,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0502, 0.0502, 0.0502, 0.0502, 0.0502, 0.0502, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.0502, 50.0502, 0.0502, 0.0502, 0.0502, 0.0502, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.0502, 100.0502, 0.0502, 0.0502, 0.0502, 0.0502, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-03-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-SV301', false,
    'pass', 'pass',
    0.153, 0.138,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.153, 0.153, 0.153, 0.153, 0.153, 0.153, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.153, 50.153, 0.153, 0.153, 0.153, 0.153, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.153, 100.153, 0.153, 0.153, 0.153, 0.153, 'pass', 'pass');

  -- SV-302: Filter 2 Inlet Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-23', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-SV302', false,
    'pass', 'pass',
    0.238, 0.214,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2376, 0.2376, 0.2376, 0.2376, 0.2376, 0.2376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.2376, 50.2376, 0.2376, 0.2376, 0.2376, 0.2376, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.2376, 100.2376, 0.2376, 0.2376, 0.2376, 0.2376, 'pass', 'pass');

  -- SV-303: Filter 1 Backwash Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-303' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-303 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-26', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-SV303', false,
    'pass', 'pass',
    0.571, 0.514,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.5709, 0.5709, 0.5709, 0.5709, 0.5709, 0.5709, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.5709, 50.5709, 0.5709, 0.5709, 0.5709, 0.5709, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.5709, 100.5709, 0.5709, 0.5709, 0.5709, 0.5709, 'pass', 'pass');

  -- SV-304: Filter 2 Backwash Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-304' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-304 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-15', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-SV304', false,
    'pass', 'pass',
    0.385, 0.347,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3852, 0.3852, 0.3852, 0.3852, 0.3852, 0.3852, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3852, 50.3852, 0.3852, 0.3852, 0.3852, 0.3852, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3852, 100.3852, 0.3852, 0.3852, 0.3852, 0.3852, 'pass', 'pass');

  -- PS-301: Filter 1 High DP Trip
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-01', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PS301', false, NULL, NULL,
    'pass', 'pass',
    0.158, 0.158,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0016, 0.0016, 0.0016, 0.158, 0.0016, 0.158, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5016, 0.5016, 0.0016, 0.158, 0.0016, 0.158, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0016, 1.0016, 0.0016, 0.158, 0.0016, 0.158, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PS301', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');

  -- PS-302: Filter 2 High DP Trip
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-13', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PS302', false,
    'pass', 'pass',
    0.41, 0.369,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0041, 0.0041, 0.0041, 0.4101, 0.0041, 0.4101, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5041, 0.5041, 0.0041, 0.4101, 0.0041, 0.4101, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0041, 1.0041, 0.0041, 0.4101, 0.0041, 0.4101, 'pass', 'pass');

  -- LS-301: Filtered Water Tank High Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LS-301' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LS-301 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-09', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-LS301', false,
    'pass', 'pass',
    0.259, 0.233,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0026, 0.0026, 0.0026, 0.2594, 0.0026, 0.2594, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5026, 0.5026, 0.0026, 0.2594, 0.0026, 0.2594, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0026, 1.0026, 0.0026, 0.2594, 0.0026, 0.2594, 'pass', 'pass');

  -- LS-302: Filtered Water Tank Low Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LS-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LS-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-02', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-LS302', false,
    'pass', 'pass',
    0.346, 0.311,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0035, 0.0035, 0.0035, 0.346, 0.0035, 0.346, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5035, 0.5035, 0.0035, 0.346, 0.0035, 0.346, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0035, 1.0035, 0.0035, 0.346, 0.0035, 0.346, 'pass', 'pass');

  -- PT-306: Filter 4 DP
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-306' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-306 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT306', false,
    'pass', 'pass',
    0.27, 0.243,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2157, 0.2157, 0.2157, 0.2697, 0.2157, 0.2697, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 20.0, 20.0, 20.2157, 20.2157, 0.2157, 0.2697, 0.2157, 0.2697, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 40.0, 40.0, 40.2157, 40.2157, 0.2157, 0.2697, 0.2157, 0.2697, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 60.0, 60.0, 60.2157, 60.2157, 0.2157, 0.2697, 0.2157, 0.2697, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 80.0, 80.0, 80.2157, 80.2157, 0.2157, 0.2697, 0.2157, 0.2697, 'pass', 'pass');

  -- FT-305: Filter 4 Effluent Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-305' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-305 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-09-20', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-FT305', false,
    'pass', 'pass',
    0.416, 0.374,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 6.2411, 6.2411, 6.2411, 0.4161, 6.2411, 0.4161, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 375.0, 375.0, 381.2411, 381.2411, 6.2411, 0.4161, 6.2411, 0.4161, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 750.0, 750.0, 756.2411, 756.2411, 6.2411, 0.4161, 6.2411, 0.4161, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1125.0, 1125.0, 1131.2411, 1131.2411, 6.2411, 0.4161, 6.2411, 0.4161, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1500.0, 1500.0, 1506.2411, 1506.2411, 6.2411, 0.4161, 6.2411, 0.4161, 'pass', 'pass');

  -- LT-305: Filter 4 Water Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-305' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-305 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-03', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-LT305', false,
    'pass', 'pass',
    0.381, 0.343,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0114, 0.0114, 0.0114, 0.3808, 0.0114, 0.3808, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7614, 0.7614, 0.0114, 0.3808, 0.0114, 0.3808, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5114, 1.5114, 0.0114, 0.3808, 0.0114, 0.3808, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2614, 2.2614, 0.0114, 0.3808, 0.0114, 0.3808, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0114, 3.0114, 0.0114, 0.3808, 0.0114, 0.3808, 'pass', 'pass');

  -- AT-306: Filter 4 Effluent Turbidity
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-306' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-306 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-04', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-AT306', false,
    'pass', 'pass',
    0.091, 0.082,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0018, 0.0018, 0.0018, 0.0906, 0.0018, 0.0906, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5018, 0.5018, 0.0018, 0.0906, 0.0018, 0.0906, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0018, 1.0018, 0.0018, 0.0906, 0.0018, 0.0906, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5018, 1.5018, 0.0018, 0.0906, 0.0018, 0.0906, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0018, 2.0018, 0.0018, 0.0906, 0.0018, 0.0906, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-04-07', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-AT306', false,
    'pass', 'pass',
    0.096, 0.086,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0019, 0.0019, 0.0019, 0.0956, 0.0019, 0.0956, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5019, 0.5019, 0.0019, 0.0956, 0.0019, 0.0956, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0019, 1.0019, 0.0019, 0.0956, 0.0019, 0.0956, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5019, 1.5019, 0.0019, 0.0956, 0.0019, 0.0956, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0019, 2.0019, 0.0019, 0.0956, 0.0019, 0.0956, 'pass', 'pass');

  -- PT-307: Filtered Water Pump Suction
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-307' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-307 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-16', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-FIL-PT307', false,
    'pass', 'pass',
    0.275, 0.248,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.5501, 0.5501, 0.5501, 0.275, 0.5501, 0.275, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.5501, 50.5501, 0.5501, 0.275, 0.5501, 0.275, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.5501, 100.5501, 0.5501, 0.275, 0.5501, 0.275, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 150.0, 150.0, 150.5501, 150.5501, 0.5501, 0.275, 0.5501, 0.275, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 200.0, 200.0, 200.5501, 200.5501, 0.5501, 0.275, 0.5501, 0.275, 'pass', 'pass');

  -- PT-308: Filtered Water Pump Discharge
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-308' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-308 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-05', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-FIL-PT308', false,
    'pass', 'pass',
    0.194, 0.174,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.5504, 1.5504, 1.5504, 0.1938, 1.5504, 0.1938, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 200.0, 200.0, 201.5504, 201.5504, 1.5504, 0.1938, 1.5504, 0.1938, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 400.0, 400.0, 401.5504, 401.5504, 1.5504, 0.1938, 1.5504, 0.1938, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 600.0, 600.0, 601.5504, 601.5504, 1.5504, 0.1938, 1.5504, 0.1938, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 800.0, 800.0, 801.5504, 801.5504, 1.5504, 0.1938, 1.5504, 0.1938, 'pass', 'pass');

  -- AT-307: Filtered Water Chlorine Demand
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-307' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-307 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-FIL-AT307', false,
    'pass', 'pass',
    0.574, 0.517,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0574, 0.0574, 0.0574, 0.574, 0.0574, 0.574, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5574, 2.5574, 0.0574, 0.574, 0.0574, 0.574, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0574, 5.0574, 0.0574, 0.574, 0.0574, 0.574, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5574, 7.5574, 0.0574, 0.574, 0.0574, 0.574, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0574, 10.0574, 0.0574, 0.574, 0.0574, 0.574, 'pass', 'pass');

  -- TT-302: Filtered Water Pump Bearing Temp
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-302' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-302 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-FIL-TT302', false,
    'pass', 'pass',
    0.415, 0.374,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4981, 0.4981, 0.4981, 0.4151, 0.4981, 0.4151, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 30.0, 30.0, 30.4981, 30.4981, 0.4981, 0.4151, 0.4981, 0.4151, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 60.0, 60.0, 60.4981, 60.4981, 0.4981, 0.4151, 0.4981, 0.4151, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 90.0, 90.0, 90.4981, 90.4981, 0.4981, 0.4151, 0.4981, 0.4151, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 120.0, 120.0, 120.4981, 120.4981, 0.4981, 0.4151, 0.4981, 0.4151, 'pass', 'pass');

  -- AT-401: Chlorine Dose Point Residual
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-11', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT401', false, NULL, NULL,
    'pass', 'pass',
    0.121, 0.121,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0121, 0.0121, 0.0121, 0.121, 0.0121, 0.121, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5121, 2.5121, 0.0121, 0.121, 0.0121, 0.121, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0121, 5.0121, 0.0121, 0.121, 0.0121, 0.121, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5121, 7.5121, 0.0121, 0.121, 0.0121, 0.121, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0121, 10.0121, 0.0121, 0.121, 0.0121, 0.121, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-26', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT401', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.065, 0.0033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.565, 2.5032, 0.065, 0.65, 0.0032, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.065, 5.0033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.565, 7.5033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.065, 10.0032, 0.065, 0.65, 0.0032, 0.0325, 'fail', 'pass');

  -- AT-402: Post-Chlorination Free Cl2
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-24', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT402', false, NULL, NULL,
    'pass', 'pass',
    0.149, 0.149,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0149, 0.0149, 0.0149, 0.1488, 0.0149, 0.1488, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5149, 2.5149, 0.0149, 0.1488, 0.0149, 0.1488, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0149, 5.0149, 0.0149, 0.1488, 0.0149, 0.1488, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5149, 7.5149, 0.0149, 0.1488, 0.0149, 0.1488, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0149, 10.0149, 0.0149, 0.1488, 0.0149, 0.1488, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-21', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT402', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.065, 0.0033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.565, 2.5032, 0.065, 0.65, 0.0032, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.065, 5.0033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.565, 7.5033, 0.065, 0.65, 0.0033, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.065, 10.0032, 0.065, 0.65, 0.0032, 0.0325, 'fail', 'pass');

  -- AT-403: Network Entry Point Free Cl2
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-403' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-403 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-19', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-AT403', false,
    'pass', 'pass',
    0.055, 0.05,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0055, 0.0055, 0.0055, 0.0552, 0.0055, 0.0552, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5055, 2.5055, 0.0055, 0.0552, 0.0055, 0.0552, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0055, 5.0055, 0.0055, 0.0552, 0.0055, 0.0552, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5055, 7.5055, 0.0055, 0.0552, 0.0055, 0.0552, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0055, 10.0055, 0.0055, 0.0552, 0.0055, 0.0552, 'pass', 'pass');

  -- AT-404: pH Post Disinfection
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-404' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-404 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-03', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-AT404', false,
    'pass', 'pass',
    0.212, 0.19,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 4.0, 4.0, 4.0127, 4.0127, 0.0127, 0.2117, 0.0127, 0.2117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 5.5, 5.5, 5.5127, 5.5127, 0.0127, 0.2117, 0.0127, 0.2117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 7.0, 7.0, 7.0127, 7.0127, 0.0127, 0.2117, 0.0127, 0.2117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 8.5, 8.5, 8.5127, 8.5127, 0.0127, 0.2117, 0.0127, 0.2117, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.0127, 10.0127, 0.0127, 0.2117, 0.0127, 0.2117, 'pass', 'pass');

  -- AT-405: UV Transmittance
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-405' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-405 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-05', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT405', false,
    'pass', 'pass',
    0.49, 0.441,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4897, 0.4897, 0.4897, 0.4897, 0.4897, 0.4897, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.4897, 25.4897, 0.4897, 0.4897, 0.4897, 0.4897, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.4897, 50.4897, 0.4897, 0.4897, 0.4897, 0.4897, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.4897, 75.4897, 0.4897, 0.4897, 0.4897, 0.4897, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.4897, 100.4897, 0.4897, 0.4897, 0.4897, 0.4897, 'pass', 'pass');

  -- AT-406: Fluoride Residual
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-406' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-406 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-27', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT406', false, NULL, NULL,
    'pass', 'pass',
    0.054, 0.054,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0027, 0.0027, 0.0027, 0.0537, 0.0027, 0.0537, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2527, 1.2527, 0.0027, 0.0537, 0.0027, 0.0537, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5027, 2.5027, 0.0027, 0.0537, 0.0027, 0.0537, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7527, 3.7527, 0.0027, 0.0537, 0.0027, 0.0537, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0027, 5.0027, 0.0027, 0.0537, 0.0027, 0.0537, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-23', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT406', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0325, 0.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 1.25, 1.25, 1.2825, 1.2516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 2.5, 2.5, 2.5325, 2.5016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 3.75, 3.75, 3.7825, 3.7516, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 5.0, 5.0, 5.0325, 5.0016, 0.0325, 0.65, 0.0016, 0.0325, 'fail', 'pass');

  -- AT-407: Network Cl2 Remote Zone 1
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-407' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-407 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT407', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0035, 0.0035, 0.0035, 0.035, 0.0035, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5039, 2.5039, 0.0039, 0.0387, 0.0039, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0042, 5.0042, 0.0043, 0.0425, 0.0043, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5046, 7.5046, 0.0046, 0.0462, 0.0046, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.005, 10.005, 0.005, 0.05, 0.005, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT407', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.014, 0.014, 0.014, 0.14, 0.014, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5155, 2.5155, 0.0155, 0.155, 0.0155, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.017, 5.017, 0.017, 0.17, 0.017, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5185, 7.5185, 0.0185, 0.185, 0.0185, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.02, 10.02, 0.02, 0.2, 0.02, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-AT407', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0245, 0.0245, 0.0245, 0.245, 0.0245, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5271, 2.5271, 0.0271, 0.2712, 0.0271, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0297, 5.0297, 0.0297, 0.2975, 0.0297, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5324, 7.5324, 0.0324, 0.3237, 0.0324, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.035, 10.035, 0.035, 0.35, 0.035, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-AT407', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.035, 0.035, 0.035, 0.35, 0.035, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5387, 2.5387, 0.0387, 0.3875, 0.0387, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0425, 5.0425, 0.0425, 0.425, 0.0425, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5462, 7.5462, 0.0462, 0.4625, 0.0462, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.05, 10.05, 0.05, 0.5, 0.05, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT407', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0455, 0.0455, 0.0455, 0.455, 0.0455, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5504, 2.5504, 0.0504, 0.5037, 0.0504, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0553, 5.0553, 0.0553, 0.5525, 0.0553, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5601, 7.5601, 0.0601, 0.6012, 0.0601, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.065, 10.065, 0.065, 0.65, 0.065, 0.65, 'pass', 'pass');

  -- AT-408: Network Cl2 Remote Zone 2
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-408' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-408 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT408', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0035, 0.0035, 0.0035, 0.035, 0.0035, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5039, 2.5039, 0.0039, 0.0387, 0.0039, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0042, 5.0042, 0.0043, 0.0425, 0.0043, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5046, 7.5046, 0.0046, 0.0462, 0.0046, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.005, 10.005, 0.005, 0.05, 0.005, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-10', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT408', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.014, 0.014, 0.014, 0.14, 0.014, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5155, 2.5155, 0.0155, 0.155, 0.0155, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.017, 5.017, 0.017, 0.17, 0.017, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5185, 7.5185, 0.0185, 0.185, 0.0185, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.02, 10.02, 0.02, 0.2, 0.02, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-25', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-AT408', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0245, 0.0245, 0.0245, 0.245, 0.0245, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5271, 2.5271, 0.0271, 0.2712, 0.0271, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0297, 5.0297, 0.0297, 0.2975, 0.0297, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5324, 7.5324, 0.0324, 0.3237, 0.0324, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.035, 10.035, 0.035, 0.35, 0.035, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-10', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-AT408', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.035, 0.035, 0.035, 0.35, 0.035, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5387, 2.5387, 0.0387, 0.3875, 0.0387, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0425, 5.0425, 0.0425, 0.425, 0.0425, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5462, 7.5462, 0.0462, 0.4625, 0.0462, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.05, 10.05, 0.05, 0.5, 0.05, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-25', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-AT408', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0455, 0.0455, 0.0455, 0.455, 0.0455, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2.5, 2.5, 2.5504, 2.5504, 0.0504, 0.5037, 0.0504, 0.5037, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 5.0, 5.0, 5.0553, 5.0553, 0.0553, 0.5525, 0.0553, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 7.5, 7.5, 7.5601, 7.5601, 0.0601, 0.6012, 0.0601, 0.6012, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 10.0, 10.0, 10.065, 10.065, 0.065, 0.65, 0.065, 0.65, 'pass', 'pass');

  -- FT-401: Chlorine Gas Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-06-28', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-FT401', false, NULL, NULL,
    'pass', 'pass',
    0.177, 0.177,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0887, 0.0887, 0.0887, 0.1775, 0.0887, 0.1775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 12.5, 12.5, 12.5887, 12.5887, 0.0887, 0.1775, 0.0887, 0.1775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 25.0, 25.0, 25.0887, 25.0887, 0.0887, 0.1775, 0.0887, 0.1775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 37.5, 37.5, 37.5887, 37.5887, 0.0887, 0.1775, 0.0887, 0.1775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 50.0, 50.0, 50.0887, 50.0887, 0.0887, 0.1775, 0.0887, 0.1775, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-02', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-FT401', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    0.65, 0.065,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.325, 0.0163, 0.325, 0.65, 0.0163, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 12.5, 12.5, 12.825, 12.5162, 0.325, 0.65, 0.0162, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 25.0, 25.0, 25.325, 25.0162, 0.325, 0.65, 0.0162, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 37.5, 37.5, 37.825, 37.5162, 0.325, 0.65, 0.0162, 0.0325, 'fail', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 50.0, 50.0, 50.325, 50.0162, 0.325, 0.65, 0.0162, 0.0325, 'fail', 'pass');

  -- FT-402: Sodium Hypochlorite Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-08', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-FT402', false,
    'pass', 'pass',
    0.269, 0.242,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 1.3463, 1.3463, 1.3463, 0.2693, 1.3463, 0.2693, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 125.0, 125.0, 126.3463, 126.3463, 1.3463, 0.2693, 1.3463, 0.2693, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 250.0, 250.0, 251.3463, 251.3463, 1.3463, 0.2693, 1.3463, 0.2693, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 375.0, 375.0, 376.3463, 376.3463, 1.3463, 0.2693, 1.3463, 0.2693, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 500.0, 500.0, 501.3463, 501.3463, 1.3463, 0.2693, 1.3463, 0.2693, 'pass', 'pass');

  -- FT-403: Fluoride Dosing Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-403' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-403 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-FT403', false,
    'pass', 'pass',
    0.082, 0.074,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0825, 0.0825, 0.0825, 0.0825, 0.0825, 0.0825, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 25.0, 25.0, 25.0825, 25.0825, 0.0825, 0.0825, 0.0825, 0.0825, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 50.0, 50.0, 50.0825, 50.0825, 0.0825, 0.0825, 0.0825, 0.0825, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 75.0, 75.0, 75.0825, 75.0825, 0.0825, 0.0825, 0.0825, 0.0825, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 100.0, 100.0, 100.0825, 100.0825, 0.0825, 0.0825, 0.0825, 0.0825, 'pass', 'pass');

  -- FT-404: Treated Water to Distribution
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-404' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-404 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-31', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-FT404', false,
    'pass', 'pass',
    0.099, 0.089,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 7.955, 7.955, 7.955, 0.0994, 7.955, 0.0994, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2000.0, 2000.0, 2007.955, 2007.955, 7.955, 0.0994, 7.955, 0.0994, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 4000.0, 4000.0, 4007.955, 4007.955, 7.955, 0.0994, 7.955, 0.0994, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 6000.0, 6000.0, 6007.955, 6007.955, 7.955, 0.0994, 7.955, 0.0994, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 8000.0, 8000.0, 8007.955, 8007.955, 7.955, 0.0994, 7.955, 0.0994, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-03-31', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-FT404', false,
    'pass', 'pass',
    0.072, 0.065,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 5.7709, 5.7709, 5.7709, 0.0721, 5.7709, 0.0721, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 2000.0, 2000.0, 2005.7709, 2005.7709, 5.7709, 0.0721, 5.7709, 0.0721, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 4000.0, 4000.0, 4005.7709, 4005.7709, 5.7709, 0.0721, 5.7709, 0.0721, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 6000.0, 6000.0, 6005.7709, 6005.7709, 5.7709, 0.0721, 5.7709, 0.0721, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 8000.0, 8000.0, 8005.7709, 8005.7709, 5.7709, 0.0721, 5.7709, 0.0721, 'pass', 'pass');

  -- FT-405: Zone 1 Distribution Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-405' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-405 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-04-01', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-FT405', false,
    'pass', 'pass',
    0.271, 0.244,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 8.1305, 8.1305, 8.1305, 0.271, 8.1305, 0.271, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 750.0, 750.0, 758.1305, 758.1305, 8.1305, 0.271, 8.1305, 0.271, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1500.0, 1500.0, 1508.1305, 1508.1305, 8.1305, 0.271, 8.1305, 0.271, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2250.0, 2250.0, 2258.1305, 2258.1305, 8.1305, 0.271, 8.1305, 0.271, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3000.0, 3000.0, 3008.1305, 3008.1305, 8.1305, 0.271, 8.1305, 0.271, 'pass', 'pass');

  -- FT-406: Zone 2 Distribution Flow
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FT-406' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FT-406 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-06', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-FT406', false,
    'pass', 'pass',
    0.24, 0.216,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 4.8035, 4.8035, 4.8035, 0.2402, 4.8035, 0.2402, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 500.0, 500.0, 504.8035, 504.8035, 4.8035, 0.2402, 4.8035, 0.2402, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1000.0, 1000.0, 1004.8035, 1004.8035, 4.8035, 0.2402, 4.8035, 0.2402, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1500.0, 1500.0, 1504.8035, 1504.8035, 4.8035, 0.2402, 4.8035, 0.2402, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2000.0, 2000.0, 2004.8035, 2004.8035, 4.8035, 0.2402, 4.8035, 0.2402, 'pass', 'pass');

  -- PT-401: Distribution Header Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-05', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-PT401', false,
    'pass', 'pass',
    0.077, 0.07,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.6199, 0.6199, 0.6199, 0.0775, 0.6199, 0.0775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 200.0, 200.0, 200.6199, 200.6199, 0.6199, 0.0775, 0.6199, 0.0775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 400.0, 400.0, 400.6199, 400.6199, 0.6199, 0.0775, 0.6199, 0.0775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 600.0, 600.0, 600.6199, 600.6199, 0.6199, 0.0775, 0.6199, 0.0775, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 800.0, 800.0, 800.6199, 800.6199, 0.6199, 0.0775, 0.6199, 0.0775, 'pass', 'pass');

  -- PT-402: Zone 1 Network Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-21', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-PT402', false,
    'pass', 'pass',
    0.155, 0.14,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.9326, 0.9326, 0.9326, 0.1554, 0.9326, 0.1554, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 150.0, 150.0, 150.9326, 150.9326, 0.9326, 0.1554, 0.9326, 0.1554, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 300.0, 300.0, 300.9326, 300.9326, 0.9326, 0.1554, 0.9326, 0.1554, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 450.0, 450.0, 450.9326, 450.9326, 0.9326, 0.1554, 0.9326, 0.1554, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 600.0, 600.0, 600.9326, 600.9326, 0.9326, 0.1554, 0.9326, 0.1554, 'pass', 'pass');

  -- PT-403: Zone 2 Network Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-403' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-403 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-20', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-PT403', false,
    'pass', 'pass',
    0.075, 0.067,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.4495, 0.4495, 0.4495, 0.0749, 0.4495, 0.0749, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 150.0, 150.0, 150.4495, 150.4495, 0.4495, 0.0749, 0.4495, 0.0749, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 300.0, 300.0, 300.4495, 300.4495, 0.4495, 0.0749, 0.4495, 0.0749, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 450.0, 450.0, 450.4495, 450.4495, 0.4495, 0.0749, 0.4495, 0.0749, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 600.0, 600.0, 600.4495, 600.4495, 0.4495, 0.0749, 0.4495, 0.0749, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status
  ) VALUES (
    v_inst_id, '2026-04-04', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-PT403', false,
    'pass', 'pass',
    0.118, 0.107,
    'submitted'
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.7108, 0.7108, 0.7108, 0.1185, 0.7108, 0.1185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 150.0, 150.0, 150.7108, 150.7108, 0.7108, 0.1185, 0.7108, 0.1185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 300.0, 300.0, 300.7108, 300.7108, 0.7108, 0.1185, 0.7108, 0.1185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 450.0, 450.0, 450.7108, 450.7108, 0.7108, 0.1185, 0.7108, 0.1185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 600.0, 600.0, 600.7108, 600.7108, 0.7108, 0.1185, 0.7108, 0.1185, 'pass', 'pass');

  -- PT-404: UV Reactor Inlet Pressure
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PT-404' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PT-404 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-12-05', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-PT404', false,
    'pass', 'pass',
    0.21, 0.189,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.6307, 0.6307, 0.6307, 0.2102, 0.6307, 0.2102, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 75.0, 75.0, 75.6307, 75.6307, 0.6307, 0.2102, 0.6307, 0.2102, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 150.0, 150.0, 150.6307, 150.6307, 0.6307, 0.2102, 0.6307, 0.2102, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 225.0, 225.0, 225.6307, 225.6307, 0.6307, 0.2102, 0.6307, 0.2102, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 300.0, 300.0, 300.6307, 300.6307, 0.6307, 0.2102, 0.6307, 0.2102, 'pass', 'pass');

  -- LT-401: Treated Water Storage Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-11-10', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-LT401', false,
    'pass', 'pass',
    0.191, 0.172,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0229, 0.0229, 0.0229, 0.1908, 0.0229, 0.1908, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 3.0, 3.0, 3.0229, 3.0229, 0.0229, 0.1908, 0.0229, 0.1908, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 6.0, 6.0, 6.0229, 6.0229, 0.0229, 0.1908, 0.0229, 0.1908, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 9.0, 9.0, 9.0229, 9.0229, 0.0229, 0.1908, 0.0229, 0.1908, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 12.0, 12.0, 12.0229, 12.0229, 0.0229, 0.1908, 0.0229, 0.1908, 'pass', 'pass');

  -- LT-402: Chemical Day Tank Cl2 Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-02-21', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-LT402', false, NULL, NULL,
    'pass', 'pass',
    0.05, 0.045,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.001, 0.001, 0.001, 0.035, 0.001, 0.035, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7512, 0.7512, 0.0012, 0.0387, 0.0012, 0.0387, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5013, 1.5013, 0.0013, 0.0425, 0.0013, 0.0425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2514, 2.2514, 0.0014, 0.0462, 0.0014, 0.0462, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0015, 3.0015, 0.0015, 0.05, 0.0015, 0.05, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-05-15', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-LT402', false, NULL, NULL,
    'pass', 'pass',
    0.2, 0.18,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0042, 0.0042, 0.0042, 0.14, 0.0042, 0.14, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7547, 0.7547, 0.0046, 0.155, 0.0046, 0.155, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5051, 1.5051, 0.0051, 0.17, 0.0051, 0.17, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2555, 2.2555, 0.0055, 0.185, 0.0055, 0.185, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.006, 3.006, 0.006, 0.2, 0.006, 0.2, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-06', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-LT402', false, NULL, NULL,
    'pass', 'pass',
    0.35, 0.315,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0073, 0.0073, 0.0073, 0.245, 0.0073, 0.245, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7581, 0.7581, 0.0081, 0.2712, 0.0081, 0.2712, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5089, 1.5089, 0.0089, 0.2975, 0.0089, 0.2975, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2597, 2.2597, 0.0097, 0.3237, 0.0097, 0.3237, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0105, 3.0105, 0.0105, 0.35, 0.0105, 0.35, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-10-28', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-LT402', false, NULL, NULL,
    'marginal', 'marginal',
    0.5, 0.45,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0105, 0.0105, 0.0105, 0.35, 0.0105, 0.35, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7616, 0.7616, 0.0116, 0.3875, 0.0116, 0.3875, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5128, 1.5128, 0.0127, 0.425, 0.0127, 0.425, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.2639, 2.2639, 0.0139, 0.4625, 0.0139, 0.4625, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.015, 3.015, 0.015, 0.5, 0.015, 0.5, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-LT402', false, NULL, NULL,
    'marginal', 'marginal',
    0.65, 0.585,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0137, 0.0137, 0.0137, 0.455, 0.0137, 0.455, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.75, 0.75, 0.7651, 0.7651, 0.0151, 0.5038, 0.0151, 0.5038, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.5, 1.5, 1.5166, 1.5166, 0.0166, 0.5525, 0.0166, 0.5525, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 2.25, 2.25, 2.268, 2.268, 0.018, 0.6013, 0.018, 0.6013, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 3.0, 3.0, 3.0195, 3.0195, 0.0195, 0.65, 0.0195, 0.65, 'pass', 'pass');

  -- LT-403: Fluoride Tank Level
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LT-403' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LT-403 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-08-19', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-LT403', false,
    'pass', 'pass',
    0.379, 0.341,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0076, 0.0076, 0.0076, 0.3792, 0.0076, 0.3792, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5076, 0.5076, 0.0076, 0.3792, 0.0076, 0.3792, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0076, 1.0076, 0.0076, 0.3792, 0.0076, 0.3792, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 1.5, 1.5, 1.5076, 1.5076, 0.0076, 0.3792, 0.0076, 0.3792, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 2.0, 2.0, 2.0076, 2.0076, 0.0076, 0.3792, 0.0076, 0.3792, 'pass', 'pass');

  -- TT-401: Treated Water Temperature
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'TT-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument TT-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-18', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-TT401', false,
    'pass', 'pass',
    0.273, 0.246,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.1093, 0.1093, 0.1093, 0.2732, 0.1093, 0.2732, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 10.0, 10.0, 10.1093, 10.1093, 0.1093, 0.2732, 0.1093, 0.2732, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 20.0, 20.0, 20.1093, 20.1093, 0.1093, 0.2732, 0.1093, 0.2732, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 30.0, 30.0, 30.1093, 30.1093, 0.1093, 0.2732, 0.1093, 0.2732, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 40.0, 40.0, 40.1093, 40.1093, 0.1093, 0.2732, 0.1093, 0.2732, 'pass', 'pass');

  -- PS-401: Low Pressure Trip Network
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-06', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-PS401', false, NULL, NULL,
    'pass', 'pass',
    0.117, 0.117,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0012, 0.0012, 0.0012, 0.1169, 0.0012, 0.1169, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5012, 0.5012, 0.0012, 0.1169, 0.0012, 0.1169, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0012, 1.0012, 0.0012, 0.1169, 0.0012, 0.1169, 'pass', 'pass');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-05', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-PS401', true, 'Zero and span', 'Adjusted to within tolerance',
    'fail', 'pass',
    1.3, 0.13,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.013, 0.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.513, 0.5007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.013, 1.0007, 0.013, 1.3, 0.0007, 0.065, 'pass', 'pass');

  -- PS-402: Cl2 Gas Leak Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'PS-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument PS-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-02-01', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-PS402', false,
    'pass', 'pass',
    0.287, 0.258,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0029, 0.0029, 0.0029, 0.2865, 0.0029, 0.2865, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5029, 0.5029, 0.0029, 0.2865, 0.0029, 0.2865, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0029, 1.0029, 0.0029, 0.2865, 0.0029, 0.2865, 'pass', 'pass');

  -- FS-401: Distribution Pump 1 Flow Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'FS-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument FS-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-02', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-FS401', false,
    'pass', 'pass',
    0.509, 0.458,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0051, 0.0051, 0.0051, 0.5087, 0.0051, 0.5087, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5051, 0.5051, 0.0051, 0.5087, 0.0051, 0.5087, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0051, 1.0051, 0.0051, 0.5087, 0.0051, 0.5087, 'pass', 'pass');

  -- LS-401: Treated Storage High Level Switch
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'LS-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument LS-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-22', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-LS401', false,
    'pass', 'pass',
    0.467, 0.42,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0047, 0.0047, 0.0047, 0.4665, 0.0047, 0.4665, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.5, 0.5, 0.5047, 0.5047, 0.0047, 0.4665, 0.0047, 0.4665, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 1.0, 1.0, 1.0047, 1.0047, 0.0047, 0.4665, 0.0047, 0.4665, 'pass', 'pass');

  -- SV-401: Distribution Pressure Control Vv
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-401' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-401 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2025-07-10', 'routine',
    'Tom Barker', 'Druck DPI 610',
    'DR-6101-5543', 'NATA-2025-001', '2027-03-31',
    'CAL-WTP-DIS-SV401', false,
    'pass', 'pass',
    0.306, 0.276,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.3062, 0.3062, 0.3062, 0.3062, 0.3062, 0.3062, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.3062, 50.3062, 0.3062, 0.3062, 0.3062, 0.3062, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.3062, 100.3062, 0.3062, 0.3062, 0.3062, 0.3062, 'pass', 'pass');

  -- SV-402: Cl2 Metering Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-402' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-402 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-01-31', 'routine',
    'Lisa Chen', 'Yokogawa CA150',
    'YK-CA150-2201', 'NATA-2024-003', '2026-11-30',
    'CAL-WTP-DIS-SV402', false,
    'pass', 'pass',
    0.104, 0.094,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.1041, 0.1041, 0.1041, 0.1041, 0.1041, 0.1041, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.1041, 50.1041, 0.1041, 0.1041, 0.1041, 0.1041, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.1041, 100.1041, 0.1041, 0.1041, 0.1041, 0.1041, 'pass', 'pass');

  -- SV-403: Fluoride Dosing Valve
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'SV-403' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument SV-403 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-14', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator',
    'FL754-22019', 'NATA-2024-001', '2026-12-31',
    'CAL-WTP-DIS-SV403', false,
    'pass', 'pass',
    0.223, 0.2,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.2227, 0.2227, 0.2227, 0.2227, 0.2227, 0.2227, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 50.0, 50.0, 50.2227, 50.2227, 0.2227, 0.2227, 0.2227, 0.2227, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 100.0, 100.0, 100.2227, 100.2227, 0.2227, 0.2227, 0.2227, 0.2227, 'pass', 'pass');

  -- AT-409: Cryptosporidium Surrogate Monitor
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = 'AT-409' AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN RAISE EXCEPTION 'Instrument AT-409 not found'; END IF;

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description,
    reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst_id, '2026-03-03', 'routine',
    'Sarah Mitchell', 'Beamex MC6 Multifunction',
    'BX-MC6-8812', 'NATA-2024-002', '2026-09-30',
    'CAL-WTP-DIS-AT409', false,
    'pass', 'pass',
    0.185, 0.166,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec_id;

  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 1, 0.0, 0.0, 0.0018, 0.0018, 0.0018, 0.1849, 0.0018, 0.1849, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 2, 0.25, 0.25, 0.2518, 0.2518, 0.0018, 0.1849, 0.0018, 0.1849, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 3, 0.5, 0.5, 0.5018, 0.5018, 0.0018, 0.1849, 0.0018, 0.1849, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 4, 0.75, 0.75, 0.7518, 0.7518, 0.0018, 0.1849, 0.0018, 0.1849, 'pass', 'pass');
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (v_rec_id, 5, 1.0, 1.0, 1.0018, 1.0018, 0.0018, 0.1849, 0.0018, 0.1849, 'pass', 'pass');

END $$;

COMMIT;

-- Total instruments: 130
-- Overdue: 20 | Drift/Marginal: 13 | Pending Approval: 8
-- Current: 89