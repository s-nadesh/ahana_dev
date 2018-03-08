CREATE VIEW `v_billing_professionals` AS (
SELECT
  `a`.`tenant_id`        AS `tenant_id`,
  `a`.`encounter_id`     AS `encounter_id`,
  `a`.`patient_id`       AS `patient_id`,
  `a`.`consultant_id`    AS `category_id`,
  'Professional Charges' AS `category`,
  MAX(`a`.`consult_date`) AS `date`,
  CONCAT(`b`.`title_code`,' ',`b`.`name`) AS `headers`,
  IFNULL(TRUNCATE(AVG(`a`.`charge_amount`),2),0) AS `charge`,
  COUNT(`a`.`pat_consult_id`) AS `visit_count`,
  'D'                    AS `trans_mode`,
  IFNULL(SUM(`a`.`charge_amount`),0) AS `total_charge`,
  IFNULL((SELECT `c`.`extra_amount` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`consultant_id` AND `c`.`ec_type` = 'C'),0) AS `extra_amount`,
  IFNULL((SELECT `c`.`concession_amount` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`consultant_id` AND `c`.`ec_type` = 'C'),0) AS `concession_amount`,
  IFNULL((SELECT `c`.`ec_id` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`consultant_id` AND `c`.`ec_type` = 'C' LIMIT 1),0) AS `ec_id`,
  IFNULL((SELECT `c`.`ec_type` FROM `pat_billing_extra_concession` `c` WHERE `c`.`encounter_id` = `a`.`encounter_id` AND `c`.`patient_id` = `a`.`patient_id` AND `c`.`link_id` = `a`.`consultant_id` AND `c`.`ec_type` = 'C' LIMIT 1),0) AS `ec_type`
FROM (`pat_consultant` `a`
   JOIN `co_user` `b`
     ON (`b`.`user_id` = `a`.`consultant_id`))
WHERE `a`.`status` = '1'
    AND `a`.`deleted_at` = '0000-00-00 00:00:00'
GROUP BY `a`.`encounter_id`,`a`.`consultant_id`)