<?php

namespace common\models;

use common\models\query\PhaPurchaseItemQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_purchase_item".
 *
 * @property integer $purchase_item_id
 * @property integer $tenant_id
 * @property integer $purchase_id
 * @property integer $product_id
 * @property integer $batch_id
 * @property integer $quantity
 * @property integer $free_quantity
 * @property integer $free_quantity_package_unit
 * @property string $free_quantity_unit
 * @property string $mrp
 * @property string $purchase_rate
 * @property string $purchase_amount
 * @property string $discount_percent
 * @property string $discount_amount
 * @property string $total_amount
 * @property integer $package_unit
 * @property string $package_name
 * @property string $vat_amount
 * @property string $vat_percent
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaProduct $product
 * @property PhaPurchase $purchase
 * @property CoTenant $tenant
 */
class PhaPurchaseItem extends RActiveRecord {

    public $expiry_date;
    public $batch_no;
    public $product_name;
    public $total_purhcase_amount;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_purchase_item';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['product_id', 'quantity', 'mrp', 'purchase_rate', 'purchase_amount', 'package_name', 'vat_amount'], 'required'],
                [['batch_no'], 'required', 'on' => 'saveform'],
                [['tenant_id', 'purchase_id', 'product_id', 'quantity', 'free_quantity', 'created_by', 'modified_by'], 'integer'],
                [['mrp', 'purchase_rate', 'purchase_amount', 'discount_percent', 'discount_amount', 'total_amount', 'vat_amount', 'vat_percent'], 'number'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'vat_percent', 'batch_id', 'expiry_date', 'free_quantity_unit', 'batch_no', 'package_unit', 'free_quantity_package_unit'], 'safe'],
                [['package_name'], 'string', 'max' => 255],
                ['purchase_rate', 'validateProductRate'],
                [['mrp', 'purchase_rate'], 'validateAmount'],
                [['quantity'], 'validateQuantity'],
                [['package_name'], 'validateBatch'],
        ];
    }

    public function validateBatch($attribute, $params) {
        $batch = PhaProductBatch::find()
                ->tenant()
                ->andWhere([
                    'product_id' => $this->product_id,
                    'batch_no' => $this->batch_no,
                    'expiry_date' => $this->expiry_date,
                ])
                ->one();

        if (!empty($batch)) {
            if ($batch->package_unit != $this->package_unit) {
                $expiry_date = date("M Y", strtotime($this->expiry_date));
                $this->addError($attribute, "Already PurchaseUnit ({$batch->package_name}) assigned to this Product ({$batch->product->getFullName()}) and Batch ({$this->batch_no}) and Exp ({$expiry_date}), So you can not choose different PurchaseUnit");
            }
        }
    }

    public function validateProductRate($attribute, $params) {
        if ($this->purchase_rate > $this->mrp)
            $this->addError($attribute, "Product Price ({$this->purchase_rate}) must be lesser than MRP ({$this->mrp}) for {$this->product->fullname}");
    }

    public function validateAmount($attribute, $params) {
        if ($this->$attribute <= 0)
            $this->addError($attribute, "{$this->getAttributeLabel($attribute)} must be greater than 0 for {$this->product->fullname}");
    }

    public function validateQuantity($attribute, $params) {
        if ($this->$attribute <= 0 && $this->free_quantity <= 0)
            $this->addError($attribute, "{$this->getAttributeLabel($attribute)} or Freequantity must be greater than 0 for {$this->product->fullname}");
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'purchase_item_id' => 'Purchase Item ID',
            'tenant_id' => 'Tenant ID',
            'purchase_id' => 'Purchase',
            'product_id' => 'Product',
            'quantity' => 'Quantity',
            'free_quantity' => 'Free Quantity',
            'mrp' => 'Mrp',
            'purchase_rate' => 'Purchase Rate',
            'purchase_amount' => 'Purchase Amount',
            'discount_percent' => 'Discount Percent',
            'discount_amount' => 'Discount Amount',
            'total_amount' => 'Total Amount',
            'package_name' => 'Package Name',
            'vat_amount' => 'Vat Amount',
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
    public function getProduct() {
        return $this->hasOne(PhaProduct::className(), ['product_id' => 'product_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPurchase() {
        return $this->hasOne(PhaPurchase::className(), ['purchase_id' => 'purchase_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getBatch() {
        return $this->hasOne(PhaProductBatch::className(), ['batch_id' => 'batch_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPhaPurchaseReturnItems() {
        return $this->hasMany(PhaPurchaseReturnItem::className(), ['purchase_item_id' => 'purchase_item_id']);
    }

    public function getPhaPurchaseReturnItemsTotal() {
        return $this->hasMany(PhaPurchaseReturnItem::className(), ['purchase_item_id' => 'purchase_item_id'])->sum('quantity');
    }

    public static function find() {
        return new PhaPurchaseItemQuery(get_called_class());
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
                return (isset($model->phaPurchaseReturnItemsTotal) ? $model->phaPurchaseReturnItemsTotal : '0');
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function beforeSave($insert) {
        $batch = $insert ? $this->_insertBatch() : $this->_updateBatch();
        $batch_rate = $this->_updateBatchRate($batch->batch_id, $this->mrp, (int) $this->package_unit);

        $this->batch_id = $batch->batch_id;
        $this->mrp = $batch_rate->mrp;
        $this->free_quantity = (!empty($this->free_quantity)) ? $this->free_quantity : 0;
        //$this->free_quantity_unit = (!empty($this->free_quantity_unit)) ? $this->free_quantity_unit : 0;

        return parent::beforeSave($insert);
    }

    private function _getBatchData() {
        return PhaProductBatch::find()
                        ->tenant()
                        ->andWhere([
                            'product_id' => $this->product_id,
                            'batch_no' => $this->batch_no,
                            'expiry_date' => $this->expiry_date,
                            'package_unit' => $this->package_unit,
//                            'package_name' => $this->package_name
                        ])
                        ->one();
    }

    //Insert Batch
    private function _insertBatch() {
        $batch = $this->_getBatchData();

        $tot_qty = (($this->quantity * (int) $this->package_unit) + ($this->free_quantity * (int) $this->free_quantity_package_unit));

        if (empty($batch)) {
            $batch = new PhaProductBatch;
            $batch->total_qty = $batch->available_qty = $tot_qty;
        } else {
            $batch->total_qty = $batch->total_qty + $tot_qty;
            $batch->available_qty = $batch->available_qty + $tot_qty;
        }

        $batch->attributes = [
            'product_id' => $this->product_id,
            'batch_no' => $this->batch_no,
            'expiry_date' => $this->expiry_date,
            'package_unit' => $this->package_unit,
            'package_name' => $this->package_name
        ];
        $batch->save(false);
        return $batch;
    }

    //Update Batch
    private function _updateBatch() {
        $batch = $this->_getBatchData();
        if (empty($batch)) {
            $batch = new PhaProductBatch;
            $batch->total_qty = $batch->available_qty = (($this->quantity * $this->package_unit) + ($this->free_quantity * $this->free_quantity_package_unit));
        } else {
            $old_qty = (($this->getOldAttribute('quantity') * $this->getOldAttribute('package_unit')) + ($this->getOldAttribute('free_quantity') * $this->getOldAttribute('free_quantity_package_unit')));
            $new_qty = (($this->quantity * $this->package_unit) + ($this->free_quantity * $this->free_quantity_package_unit));

            //Add New Quantity
            if ($old_qty < $new_qty) {
                $batch->total_qty = $batch->total_qty + ($new_qty - $old_qty);
                $batch->available_qty = $batch->available_qty + ($new_qty - $old_qty);
            }
            //Subtract New Quantity
            else if ($new_qty < $old_qty) {
                $batch->total_qty = $batch->total_qty - ($old_qty - $new_qty);
                $batch->available_qty = $batch->available_qty - ($old_qty - $new_qty);
            }
        }
        $batch->attributes = [
            'product_id' => $this->product_id,
            'batch_no' => $this->batch_no,
            'expiry_date' => $this->expiry_date,
            'package_unit' => $this->package_unit,
            'package_name' => $this->package_name
        ];
        $batch->save(false);
        return $batch;
    }

    //Update Batch
    private function _deleteBatch() {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $this->batch_id])->one();
        if (!empty($batch)) {
            $batch->total_qty = $batch->total_qty - (($this->quantity * $this->package_unit) + ($this->free_quantity * $this->free_quantity_package_unit));
            $batch->available_qty = $batch->available_qty - (($this->quantity * $this->package_unit) + ($this->free_quantity * $this->free_quantity_package_unit));
            $batch->save(false);
        }
        return;
    }

    //Update Batch Rate
    private function _updateBatchRate($batch_id, $mrp, $package_unit) {
        $batch_rate_exists = PhaProductBatchRate::find()->tenant()->andWhere(['batch_id' => $batch_id])->one(); //, 'mrp' => $mrp
        if (empty($batch_rate_exists)) {
            $batch_rate = new PhaProductBatchRate();
            $batch_rate->mrp = $this->mrp;
        } else {
            $batch_rate = $batch_rate_exists;
        }
        //Per Unit Price
        $per_unit_price = $batch_rate->mrp / $package_unit;
        $batch_rate->per_unit_price = $per_unit_price;
        $batch_rate->batch_id = $batch_id;
        $batch_rate->save(false);
        return $batch_rate;
    }

    public function afterDelete() {
        $this->_deleteBatch($this->batch_id);
        return parent::afterDelete();
    }

    public function Updatebatchqty($item) {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $item->batch_id])->one();
        if (!empty($batch)) {
            $batch->total_qty = $batch->total_qty - (($item->quantity * $item->package_unit) + ($item->free_quantity * $item->free_quantity_package_unit));
            $batch->available_qty = $batch->available_qty - (($item->quantity * $item->package_unit) + ($item->free_quantity * $item->free_quantity_package_unit));
            $batch->save(false);
        }
        return;
    }

}
