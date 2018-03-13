<?php

namespace common\models;

use common\models\query\PhaPurchaseReturnItemQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_purchase_return_item".
 *
 * @property integer $purchase_ret_item_id
 * @property integer $tenant_id
 * @property integer $purchase_ret_id
 * @property integer $purchase_item_id
 * @property integer $product_id
 * @property integer $batch_id
 * @property integer $quantity
 * @property integer $free_quantity
 * @property integer $free_quantity_unit
 * @property string $mrp
 * @property string $purchase_ret_rate
 * @property string $purchase_ret_amount
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
 * @property PhaProductBatch $batch
 * @property PhaProduct $product
 * @property PhaPurchaseReturn $purchaseRet
 * @property CoTenant $tenant
 */
class PhaPurchaseReturnItem extends PActiveRecord {

    public $expiry_date;
    public $batch_no;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_purchase_return_item';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['product_id', 'quantity', 'mrp', 'purchase_ret_rate', 'purchase_ret_amount', 'package_name', 'vat_amount'], 'required'],
                [['batch_no'], 'required', 'on' => 'saveform'],
                [['tenant_id', 'purchase_ret_id', 'product_id', 'batch_id', 'quantity', 'free_quantity', 'created_by', 'modified_by'], 'integer'],
                [['mrp', 'purchase_ret_rate', 'purchase_ret_amount', 'discount_percent', 'discount_amount', 'total_amount', 'vat_amount', 'vat_percent'], 'number'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'expiry_date', 'batch_no', 'package_unit', 'free_quantity_unit', 'purchase_item_id'], 'safe'],
                [['package_name'], 'string', 'max' => 255],
                ['purchase_ret_rate', 'validateProductRate'],
                [['quantity', 'mrp', 'purchase_ret_rate', 'purchase_ret_amount', 'total_amount'], 'validateAmount'],
        ];
    }

    public function validateProductRate($attribute, $params) {
        if ($this->purchase_ret_rate > $this->mrp)
            $this->addError($attribute, "Product Price ({$this->purchase_ret_rate}) must be lesser than MRP ({$this->mrp}) for {$this->product->fullname}");
    }

    public function validateAmount($attribute, $params) {
        if ($this->$attribute <= 0)
            $this->addError($attribute, "{$this->getAttributeLabel($attribute)} must be greater than 0 for {$this->product->fullname}");
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'purchase_ret_item_id' => 'Purchase Ret Item ID',
            'tenant_id' => 'Tenant ID',
            'purchase_ret_id' => 'Purchase Ret ID',
            'product_id' => 'Product ID',
            'batch_id' => 'Batch ID',
            'quantity' => 'Quantity',
            'free_quantity' => 'Free Quantity',
            'free_quantity_unit' => 'Free Quantity Unit',
            'mrp' => 'Mrp',
            'purchase_ret_rate' => 'Purchase Ret. Rate',
            'purchase_ret_amount' => 'Purchase Ret. Amount',
            'discount_percent' => 'Discount Percent',
            'discount_amount' => 'Discount Amount',
            'total_amount' => 'Total Amount',
            'package_name' => 'Package Name',
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
    public function getPurchaseRet() {
        return $this->hasOne(PhaPurchaseReturn::className(), ['purchase_ret_id' => 'purchase_ret_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPurchaseItem() {
        return $this->hasOne(PhaPurchaseItem::className(), ['purchase_item_id' => 'purchase_item_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaPurchaseReturnItemQuery(get_called_class());
    }

    public function getTotalReturnedQuantity() {
        $sum_qty=PhaPurchaseReturnItem::find()
                        ->tenant()
                        ->andWhere(['purchase_item_id' => $this->purchase_item_id])
                        ->andWhere("purchase_ret_item_id != " . $this->purchase_ret_item_id)
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
            'purchase_quantity' => function ($model) {
                return (isset($model->purchaseItem) ? $model->purchaseItem->quantity : '-');
            },
            'batch' => function ($model) {
                return (isset($model->batch) ? $model->batch : '-');
            },
            'total_returned_quantity' => function($model) {
                return $this->getTotalReturnedQuantity();
            }
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'purchase_return':
                    $addt_keys = ['purchase_quantity','product','batch','total_returned_quantity'];
                    $parent_fields = [
                        'purchase_ret_item_id' => 'purchase_ret_item_id',
                        'purchase_ret_id' => 'purchase_ret_id',
                        'quantity' => 'quantity',
                        'free_quantity' => 'free_quantity',
                        'free_quantity_unit' => 'free_quantity_unit',
                        'mrp' => 'mrp',
                        'purchase_ret_rate' => 'purchase_ret_rate',
                        'purchase_ret_amount' => 'purchase_ret_amount',
                        'discount_percent' => 'discount_percent',
                        'discount_amount' => 'discount_amount',
                        'vat_percent' => 'vat_percent',
                        'vat_amount' => 'vat_amount',
                        'package_name' => 'package_name',
                        'total_amount' => 'total_amount',
                    ];
                    break;
            endswitch;
        }
        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function beforeSave($insert) {
        //Update Batch
        if ($insert) {
            $batch = $this->_updateBatch($this->quantity, '-');
        } else {
            $old_qty = $this->getOldAttribute('quantity');
            $new_qty = $this->quantity;

            //Subtract New Quantity
            if ($old_qty < $new_qty) {
                $batch = $this->_updateBatch(($new_qty - $old_qty), '-');
            }
            //Add New Quantity
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
            $quantity = ($quantity * $this->package_unit);
            if ($sep == '-') {
                $batch->available_qty = $batch->available_qty - $quantity;
                $batch->total_qty = $batch->total_qty - $quantity;
            } else {
                $batch->available_qty = $batch->available_qty + $quantity;
                $batch->total_qty = $batch->total_qty + $quantity;
            }
            $batch->save(false);
        }
        return $batch;
    }

    private function _deleteBatch() {
        $batch = PhaProductBatch::find()->tenant()->andWhere(['batch_id' => $this->batch_id])->one();
        if (!empty($batch)) {
            $batch->available_qty = $batch->available_qty + $this->quantity;
            $batch->save(false);
        }
        return;
    }

    public function afterDelete() {
        $this->_deleteBatch();
        return parent::afterDelete();
    }

}
