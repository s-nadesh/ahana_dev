<?php

namespace common\models;

use common\models\query\PhaSaleReturnItemQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_sale_return_item".
 *
 * @property integer $sale_ret_item_id
 * @property integer $tenant_id
 * @property integer $sale_ret_id
 * @property integer $sale_item_id
 * @property integer $product_id
 * @property integer $batch_id
 * @property integer $quantity
 * @property string $package_name
 * @property string $mrp
 * @property string $item_amount
 * @property string $discount_percentage
 * @property string $discount_amount
 * @property string $vat_percent
 * @property string $vat_amount
 * @property string $total_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property PhaSaleReturn $saleRet
 * @property PhaProductBatch $batch
 * @property PhaProduct $product
 */
class PhaSaleReturnItem extends PActiveRecord {

    public $expiry_date;
    public $batch_no;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_sale_return_item';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['product_id', 'quantity', 'mrp'], 'required'],
            [['batch_no'], 'required', 'on' => 'saveform'],
            [['tenant_id', 'sale_ret_id', 'product_id', 'batch_id', 'quantity', 'created_by', 'modified_by'], 'integer'],
            [['mrp', 'item_amount', 'discount_percentage', 'discount_amount', 'total_amount', 'vat_percent', 'vat_amount','cgst_amount','cgst_percent','sgst_amount','sgst_percent','taxable_value'], 'number'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at', 'expiry_date', 'batch_no', 'sale_item_id', 'discount_percentage', 'discount_amount', 'total_amount', 'vat_percent', 'vat_amount', 'hsn_no', 'cgst_amount','cgst_percent','sgst_amount','sgst_percent','taxable_value'], 'safe'],
            [['package_name'], 'string', 'max' => 255],
            [['quantity', 'mrp', 'total_amount'], 'validateAmount'],
            [['expiry_date'], 'validateExpiryDate', 'on' => 'saveform'],
        ];
    }

    public function validateAmount($attribute, $params) {
        if ($this->$attribute <= 0)
            $this->addError($attribute, "{$this->getAttributeLabel($attribute)} must be greater than 0 for {$this->product->fullname}");
    }
    
    public function validateExpiryDate($attribute, $params) {
        if($this->isNewRecord && strtotime(date('Y-m', strtotime('+1 months'))) >= strtotime(date('Y-m', strtotime($this->$attribute)))){
            $this->addError($attribute, "{$this->getAttributeLabel($attribute)} must be greater than one month");
        }
    }
    
    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'sale_ret_item_id' => 'Sale Ret Item ID',
            'tenant_id' => 'Tenant ID',
            'sale_ret_id' => 'Sale Ret ID',
            'product_id' => 'Product ID',
            'batch_id' => 'Batch ID',
            'quantity' => 'Quantity',
            'package_name' => 'Package Name',
            'mrp' => 'Mrp',
            'item_amount' => 'Item Amount',
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
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getSaleRet() {
        return $this->hasOne(PhaSaleReturn::className(), ['sale_ret_id' => 'sale_ret_id']);
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
    public function getSaleItem() {
        return $this->hasOne(PhaSaleItem::className(), ['sale_item_id' => 'sale_item_id']);
    }

    public static function find() {
        return new PhaSaleReturnItemQuery(get_called_class());
    }
    
    public function getTotalReturnedQuantity() {
        $sum_qty=PhaSaleReturnItem::find()
                        ->tenant()
                        ->andWhere(['sale_item_id' => $this->sale_item_id])
                        ->andWhere("sale_ret_item_id != " . $this->sale_ret_item_id)
                        ->sum("quantity");
        if(empty($sum_qty))
           return "0";
        else
           return $sum_qty;
    }

    public function fields() {
        $extend = [
            'product' => function ($model) {
                return (isset($model->product) ? $model->product : '-');
            },
            'sale_quantity' => function ($model) {
                return (isset($model->saleItem) ? $model->saleItem->quantity : '-');
            },
            'batch' => function ($model) {
                return (isset($model->batch) ? $model->batch : '-');
            },
            'total_returned_quantity' => function($model) {
                return $this->getTotalReturnedQuantity();
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function beforeSave($insert) {
        //Update Batch
        if ($insert) {
            $batch = $this->_updateBatch($this->quantity, '+');
        } else {
            $old_qty = $this->getOldAttribute('quantity');
            $new_qty = $this->quantity;

            //Add New Quantity
            if ($old_qty < $new_qty) {
                $batch = $this->_updateBatch(($new_qty - $old_qty), '+');
            }
            //Subtract New Quantity
            else if ($new_qty < $old_qty) {
                $batch = $this->_updateBatch(($old_qty - $new_qty), '-');
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

    private function _deleteBatch() {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $this->batch_id])->one();
        if (!empty($batch)) {
            $batch->available_qty = $batch->available_qty - $this->quantity;
            $batch->save(false);
        }
        return;
    }

    public function afterDelete() {
        $this->_deleteBatch();
        return parent::afterDelete();
    }

}
