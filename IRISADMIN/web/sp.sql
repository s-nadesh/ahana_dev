CREATE PROCEDURE `pha_stock_report_by_date`(
	IN tenant_id INT(11),
	IN report_date VARCHAR(10)
)
BEGIN
SELECT 
batch_id, 
batch_no, 
product_name, 
SUM(total_purchase_qty) AS total_purchase, 
SUM(total_sale_quantity) AS total_sale, 
(SUM(total_purchase_qty) -  SUM(total_sale_quantity)) AS stock,
IFNULL(pha_stock_latest_purchase(tenant_id, report_date, batch_id, 'purchase_rate'), product_price) AS purchase_rate,
pha_stock_latest_purchase(tenant_id, report_date, batch_id, 'discount_percent') AS discount_percent,
FORMAT((SELECT purchase_rate) * (SELECT (SUM(total_purchase_qty) -  SUM(total_sale_quantity))) ,2) AS total_rate,
FORMAT((SELECT purchase_rate) * (SELECT (SUM(total_purchase_qty) -  SUM(total_sale_quantity)))  * (pha_stock_latest_purchase(tenant_id, report_date, batch_id, 'discount_percent') / 100), 2) AS dis_amount,
FORMAT(IFNULL((SELECT purchase_rate) * (SELECT (SUM(total_purchase_qty) -  SUM(total_sale_quantity))) - (SELECT purchase_rate) * (SELECT (SUM(total_purchase_qty) -  SUM(total_sale_quantity)))  * (pha_stock_latest_purchase(tenant_id, report_date, batch_id, 'discount_percent') / 100) , (SELECT purchase_rate) * (SELECT (SUM(total_purchase_qty) -  SUM(total_sale_quantity)))) , 2) AS self_value
FROM (
SELECT a.batch_id, c.batch_no, d.product_name, d.product_price AS product_price, SUM(a.quantity * a.package_unit) + SUM(a.free_quantity * a.free_quantity_package_unit) AS total_purchase_qty, 0 AS total_sale_quantity
FROM pha_purchase_item a
JOIN pha_purchase b
ON b.purchase_id = a.purchase_id
JOIN pha_product_batch c
ON c.batch_id = a.batch_id
JOIN pha_product d
ON d.product_id = a.product_id
WHERE 
b.tenant_id = tenant_id
AND b.invoice_date <= report_date
GROUP BY a.batch_id
UNION ALL
SELECT a.batch_id, c.batch_no, d.product_name, d.product_price AS product_price, SUM(a.quantity * a.package_unit)  AS total_purchase_qty, 0 AS total_sale_quantity
FROM pha_sale_return_item a
JOIN pha_sale_return b
ON b.sale_ret_id = a.sale_ret_id
JOIN pha_product_batch c
ON c.batch_id = a.batch_id
JOIN pha_product d
ON d.product_id = a.product_id
WHERE 
b.tenant_id = tenant_id
AND b.sale_date <= report_date
GROUP BY a.batch_id
UNION ALL
SELECT a.batch_id, c.batch_no, d.product_name, d.product_price AS product_price, 0 AS total_purchase_qty, SUM(a.quantity)  AS total_sale_quantity
FROM pha_sale_item a
JOIN pha_sale b
ON b.sale_id = a.sale_id
JOIN pha_product_batch c
ON c.batch_id = a.batch_id
JOIN pha_product d
ON d.product_id = a.product_id
WHERE 
b.tenant_id = tenant_id
AND b.sale_date <= report_date
GROUP BY a.batch_id
UNION ALL
SELECT a.batch_id, c.batch_no, d.product_name, d.product_price AS product_price, 0 AS total_purchase_qty, SUM(a.quantity)  AS total_sale_quantity
FROM pha_purchase_return_item a
JOIN pha_purchase_return b
ON b.purchase_ret_id = a.purchase_ret_id
JOIN pha_product_batch c
ON c.batch_id = a.batch_id
JOIN pha_product d
ON d.product_id = a.product_id
WHERE 
b.tenant_id = tenant_id
AND b.invoice_date <= report_date
GROUP BY a.batch_id
UNION ALL
SELECT a.batch_id, b.batch_no, c.product_name, c.product_price AS product_price, SUM(a.adjust_qty)  AS total_purchase_qty, 0 AS total_sale_quantity
FROM pha_stock_adjust_log a
JOIN pha_product_batch b
ON b.batch_id = a.batch_id
JOIN pha_product c
ON c.product_id = b.product_id
WHERE 
a.tenant_id = tenant_id
AND DATE(a.adjust_date_time) <= report_date
GROUP BY a.batch_id
) t1
GROUP BY batch_id;
    END