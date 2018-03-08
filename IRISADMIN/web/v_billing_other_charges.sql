CREATE VIEW `v_billing_other_charges` AS (
SELECT
  `a`.`tenant_id`          AS `tenant_id`,
  `a`.`encounter_id`       AS `encounter_id`,
  `a`.`patient_id`         AS `patient_id`,
  `a`.`charge_subcat_id`   AS `category_id`,
  `b`.`charge_cat_name`    AS `category`,
  `c`.`charge_subcat_name` AS `headers`,
  IFNULL(TRUNCATE(AVG(`a`.`charge_amount`),2),0) AS `charge`,
  COUNT(`a`.`other_charge_id`) AS `visit_count`,
  'D'                      AS `trans_mode`,
  IFNULL(SUM(`a`.`charge_amount`),0) AS `total_charge`,
  0                        AS `extra_amount`,
  0                        AS `concession_amount`,
  `a`.`other_charge_id`    AS `other_charge_id`,
  `a`.`created_at`         AS `date`
FROM ((`pat_billing_other_charges` `a`
    JOIN `co_room_charge_category` `b`
      ON (`b`.`charge_cat_id` = `a`.`charge_cat_id`))
   JOIN `co_room_charge_subcategory` `c`
     ON (`c`.`charge_subcat_id` = `a`.`charge_subcat_id`))
WHERE `a`.`status` = '1'
    AND `a`.`deleted_at` = '0000-00-00 00:00:00'
GROUP BY `a`.`encounter_id`,`a`.`charge_subcat_id`)