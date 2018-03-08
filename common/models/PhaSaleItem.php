<?php

namespace common\models;

use common\models\query\PhaSaleItemQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_sale_item".
 *
 * @property integer $sale_item_id
 * @property integer $tenant_id
 * @property integer $sale_id
 * @property integer $product_id
 * @property integer $batch_id
 * @property integer $quantity
 * @property string $package_name
 * @property string $mrp
 * @property string $item_amount
 * @property string $discount_percentage
 * @property string $discount_amount
 * @property string $total_amount
 * @property string $vat_amount
 * @property string $vat_percent
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaSale $sale
 * @property PhaProductBatch $batch
 * @property PhaProduct $product
 * @property CoTenant $tenant
 */
class PhaSaleItem extends RActiveRecord {

    public $expiry_date;
    public $batch_no;
    public $product_name;
    public $total_sale_item_amount;
    public $consultant_name;
    public $oldAttributeQuantity;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_sale_item';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['product_id', 'quantity', 'mrp'], 'required'],
                [['batch_no'], 'required', 'on' => 'saveform'],
                [['tenant_id', 'sale_id', 'product_id', 'batch_id', 'quantity', 'created_by', 'modified_by'], 'integer'],
                [['mrp', 'item_amount', 'discount_percentage', 'discount_amount', 'total_amount', 'vat_amount', 'vat_percent', 'cgst_amount', 'cgst_percent', 'sgst_amount', 'sgst_percent', 'taxable_value'], 'number'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'package_name', 'expiry_date', 'batch_no', 'hsn_no', 'oldAttributeQuantity'], 'safe'],
                [['product_id'], 'validateStock'],
        ];
    }

    public function validateStock($attribute, $params) {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['product_id' => $this->product_id, 'batch_no' => $this->batch_no, 'DATE(expiry_date)' => $this->expiry_date])->one();
        if (!empty($batch)) {
            $this->batch_id = $batch->batch_id;
            if ($this->oldAttributeQuantity) {
                $old_qty = $this->oldAttributeQuantity;
                $new_qty = $this->quantity;

                if ($old_qty < $new_qty) {
                    $check_quantity = $new_qty - $old_qty;
                    $valid = true;
                } else {
                    $check_quantity = $this->quantity;
                    $valid = false;
                }
            } else {
                $check_quantity = $this->quantity;
                $valid = true;
            }

            if ($valid && $check_quantity > $this->batch->available_qty)
                $this->addError($attribute, "{$this->product->getFullName()} quantity is greater than Stock quantity ({$this->batch->available_qty})");
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'sale_item_id' => 'Sale Item ID',
            'tenant_id' => 'Tenant ID',
            'sale_id' => 'Sale ID',
            'product_id' => 'Product ID',
            'batch_id' => 'Batch ID',
            'quantity' => 'Quantity',
            'package_name' => 'Package Name',
            'mrp' => 'Mrp',
            'item_amount' => 'Item Amount',
            'discount_percentage' => 'Discount Percentage',
            'discount_amount' => 'Discount Amount',
            'total_amount' => 'Total Amount',
            'vat_amount' => 'Vat Amount',
            'vat_percent' => 'Vat Percent',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getSale() {
        return $this->hasOne(PhaSale::className(), ['sale_id' => 'sale_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getBatch() {
        return $this->hasOne(PhaProductBatch::className(), ['batch_id' => 'batch_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getProduct() {
        return $this->hasOne(PhaProduct::className(), ['product_id' => 'product_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getPhaSaleReturnItems() {
        return $this->hasMany(PhaSaleReturnItem::className(), ['sale_item_id' => 'sale_item_id']);
    }

    public function getPhaSaleReturnItemsTotal() {
        return $this->hasMany(PhaSaleReturnItem::className(), ['sale_item_id' => 'sale_item_id'])->sum('quantity');
    }

    public static function find() {
        return new PhaSaleItemQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'product' => function ($model) {
                return (isset($model->product) ? $model->product : '-');
            },
            'batch' => function ($model) {
                return (isset($model->batch) ? $model->batch : '-');
            },
            'total_returned_quantity' => function($model) {
                return (isset($model->phaSaleReturnItemsTotal) ? $model->phaSaleReturnItemsTotal : '0');
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function beforeSave($insert) {
        //Update Batch
        if ($insert) {
            $batch = $this->_updateBatch($this->quantity, '-');
        } else {
            $old_qty = $this->getOldAttribute('quantity');
            $new_qty = $this->quantity;

            //Add New Quantity
            if ($old_qty < $new_qty) {
                $batch = $this->_updateBatch(($new_qty - $old_qty), '-');
            }
            //Subtract New Quantity
            else if ($new_qty < $old_qty) {
                $batch = $this->_updateBatch(($old_qty - $new_qty), '+');
            }
        }

        return parent::beforeSave($insert);
    }

    //Update Batch
    private function _updateBatch($quantity, $sep) {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['product_id' => $this->product_id, 'batch_no' => $this->batch_no, 'DATE(expiry_date)' => $this->expiry_date])->one();
        if (!empty($batch)) {
            $this->batch_id = $batch->batch_id;
            if ($sep == '-') {
                $batch->available_qty = $batch->available_qty - $quantity;
            } else {
                $batch->available_qty = $batch->available_qty + $quantity;
            }
            $batch->save(false);
        }
        return $batch;
    }

    private function _deleteBatch($item) {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $item->batch_id])->one();
        if (!empty($batch)) {
            $batch->available_qty = $batch->available_qty + $this->quantity;
            $batch->save(false);
        }
        return;
    }

//    public function afterDelete() {
//        $this->_deleteBatch();
//        return parent::afterDelete();
//    }

    public function Updatebatchqty($item) {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $item->batch_id])->one();
        if (!empty($batch)) {
            $batch->available_qty = $batch->available_qty + $item->quantity;
            $batch->save(false);
        }
        return;
    }

}
