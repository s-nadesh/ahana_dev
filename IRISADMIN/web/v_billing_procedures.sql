CREATE VIEW `v_billing_procedures` AS (
SELECT
  `a`.`tenant_id`          AS `tenant_id`,
  `a`.`encounter_id`       AS `encounter_id`,
  `a`.`patient_id`         AS `patient_id`,
  `a`.`charge_subcat_id`   AS `category_id`,
  'Procedure Charges'      AS `category`,
  MAX(`a`.`proc_date`)     AS `date`,
  `b`.`charge_subcat_name` AS `headers`,
  IFNULL(TRUNCATE(AVG(`a`.`charge_amount`),2),0) AS `charge`,
  COUNT(`a`.`proc_id`)     AS `visit_count`,
  'D'                      AS `trans_mode`,
  IFNULL(SUM(`a`.`charge_amount`),0) AS `total_charge`,
  IFNULL((SELECT `c`.`extra_amount` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`charge_subcat_id` AND `c`.`ec_type` = 'P'),0) AS `extra_amount`,
  IFNULL((SELECT `c`.`concession_amount` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`charge_subcat_id` AND `c`.`ec_type` = 'P'),0) AS `concession_amount`,
  IFNULL((SELECT `c`.`ec_id` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`charge_subcat_id` AND `c`.`ec_type` = 'P' LIMIT 1),0) AS `ec_id`,
  IFNULL((SELECT `c`.`ec_type` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`charge_subcat_id` AND `c`.`ec_type` = 'P' LIMIT 1),0) AS `ec_type`
FROM (`pat_procedure` `a`
   JOIN `co_room_charge_subcategory` `b`
     ON (`b`.`charge_subcat_id` = `a`.`charge_subcat_id`))
WHERE `a`.`status` = '1'
    AND `a`.`deleted_at` = '0000-00-00 00:00:00'
GROUP BY `a`.`encounter_id`,`a`.`charge_subcat_id`)