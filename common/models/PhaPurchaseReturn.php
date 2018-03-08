<?php

namespace common\models;

use common\models\query\PhaPurchaseReturnQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "pha_purchase_return".
 *
 * @property integer $purchase_ret_id
 * @property integer $tenant_id
 * @property integer $purchase_id
 * @property string $purchase_ret_code
 * @property string $invoice_date
 * @property string $invoice_no
 * @property integer $supplier_id
 * @property string $total_item_purchase_ret_amount
 * @property string $total_item_vat_amount
 * @property string $total_item_discount_amount
 * @property string $before_disc_amount
 * @property string $discount_percent
 * @property string $discount_amount
 * @property string $after_disc_amount
 * @property string $roundoff_amount
 * @property string $net_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaSupplier $supplier
 * @property CoTenant $tenant
 * @property PhaPurchase $purchase
 * @property PhaPurchaseReturnItem[] $phaPurchaseReturnItems
 */
class PhaPurchaseReturn extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_purchase_return';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['invoice_date', 'invoice_no', 'supplier_id'], 'required'],
                [['tenant_id', 'supplier_id', 'created_by', 'modified_by'], 'integer'],
                [['invoice_date', 'created_at', 'modified_at', 'deleted_at', 'purchase_id'], 'safe'],
                [['total_item_purchase_ret_amount', 'total_item_vat_amount', 'total_item_discount_amount', 'before_disc_amount', 'discount_percent', 'discount_amount', 'after_disc_amount', 'roundoff_amount', 'net_amount'], 'number'],
                [['status', 'total_item_purchase_ret_amount'], 'string'],
                [['purchase_ret_code', 'invoice_no'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'purchase_ret_id' => 'Purchase Ret ID',
            'tenant_id' => 'Tenant ID',
            'purchase_ret_code' => 'Purchase Ret Code',
            'invoice_date' => 'Invoice Date',
            'invoice_no' => 'Invoice No',
            'supplier_id' => 'Supplier ID',
            'total_item_purchase_ret_amount' => 'Total Item Purchase Amount',
            'total_item_vat_amount' => 'Total Item Vat Amount',
            'total_item_discount_amount' => 'Total Item Discount Amount',
            'before_disc_amount' => 'Before Disc Amount',
            'discount_percent' => 'Discount Percent',
            'discount_amount' => 'Discount Amount',
            'after_disc_amount' => 'After Disc Amount',
            'roundoff_amount' => 'Roundoff Amount',
            'net_amount' => 'Net Amount',
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
    public function getSupplier() {
        return $this->hasOne(PhaSupplier::className(), ['supplier_id' => 'supplier_id']);
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
    public function getPhaPurchaseReturnItems() {
        return $this->hasMany(PhaPurchaseReturnItem::className(), ['purchase_ret_id' => 'purchase_ret_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPurchase() {
        return $this->hasOne(PhaPurchase::className(), ['purchase_id' => 'purchase_id']);
    }

    public static function find() {
        return new PhaPurchaseReturnQuery(get_called_class());
    }

    public function beforeSave($insert) {
        if ($insert) {
            $this->purchase_ret_code = CoInternalCode::generateInternalCode('PR', 'common\models\PhaPurchaseReturn', 'purchase_ret_code');
        }
        return parent::beforeSave($insert);
    }

    public function fields() {
        $extend = [
            'supplier' => function ($model) {
                return (isset($model->supplier) ? $model->supplier : '-');
            },
            'purchase_date' => function ($model) {
                return (isset($model->purchase) ? $model->purchase->invoice_date : '-');
            },
            'purchase_invoice_no' => function ($model) {
                return (isset($model->purchase) ? $model->purchase->invoice_no : '-');
            },
            'items' => function ($model) {
                return (isset($model->phaPurchaseReturnItems) ? $model->phaPurchaseReturnItems : '-');
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'purchase_return':
                    $addt_keys = ['supplier', 'items'];
                    $parent_fields = [
                        'invoice_no' => 'invoice_no',
                        'invoice_date' => 'invoice_date',
                        'purchase_ret_code' => 'purchase_ret_code',
                        'total_item_purchase_ret_amount' => 'total_item_purchase_ret_amount',
                        'total_item_vat_amount' => 'total_item_vat_amount',
                        'total_item_discount_amount' => 'total_item_discount_amount',
                        'discount_percent' => 'discount_percent',
                        'discount_amount' => 'discount_amount',
                        'roundoff_amount' => 'roundoff_amount',
                        'net_amount' => 'net_amount',
                        'purchase_ret_id' => 'purchase_ret_id',
                    ];
                    break;
            endswitch;
        }
        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            CoInternalCode::increaseInternalCode("PR");
            $activity = 'Purchase Return Created Successfully (#' . $this->invoice_no . ' )';
        }
        else
            $activity = 'Purchase Return Updated Successfully (#' . $this->invoice_no . ' )';
        CoAuditLog::insertAuditLog(PhaPurchaseReturn::tableName(), $this->purchase_ret_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

    public function getProductItemIds() {
        return ArrayHelper::map($this->phaPurchaseReturnItems, 'purchase_ret_item_id', 'purchase_ret_item_id');
    }

}
