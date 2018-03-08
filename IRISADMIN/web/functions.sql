CREATE FUNCTION `pha_stock_latest_purchase`(
	tenant_id INT(11), 
	report_date VARCHAR(10), 
	batch_id INT(11), 
	col VARCHAR(255)
) RETURNS VARCHAR(255) CHARSET latin1
BEGIN
    DECLARE ret_column VARCHAR(255);
	SET ret_column = (SELECT 
	CASE 
		WHEN col = 'purchase_rate' 
		THEN a.purchase_rate     
		WHEN col = 'discount_percent'
		THEN a.discount_percent
		ELSE purchase_item_id 
	END  
	FROM pha_purchase_item a 
	JOIN pha_purchase b
	ON b.purchase_id = a.purchase_id
	WHERE b.tenant_id = tenant_id 
	AND a.batch_id = batch_id
	AND b.invoice_date <= report_date
	ORDER BY a.purchase_item_id DESC
	LIMIT 1);
RETURN (ret_column);
    END