<?php

namespace common\models;

use common\models\query\PhaPurchaseQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "pha_purchase".
 *
 * @property integer $purchase_id
 * @property integer $tenant_id
 * @property string $purchase_code
 * @property string $invoice_date
 * @property string $invoice_no
 * @property string $payment_type
 * @property integer $supplier_id
 * @property string $total_item_purchase_amount
 * @property string $total_item_vat_amount
 * @property string $total_item_discount_amount
 * @property string $discount_percent
 * @property string $discount_amount
 * @property string $roundoff_amount
 * @property string $net_amount
 * @property string $before_disc_amount
 * @property string $after_disc_amount
 * @property string $net_amount
 * @property string $payment_status
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaSupplier $supplier
 * @property CoTenant $tenant
 * @property PhaPurchaseItem[] $phaPurchaseItems
 */
class PhaPurchase extends PActiveRecord {

    public $after_save = true;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_purchase';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['invoice_date', 'invoice_no', 'supplier_id'], 'required'],
                [['tenant_id', 'supplier_id', 'created_by', 'modified_by'], 'integer'],
                [['invoice_date', 'created_at', 'modified_at', 'deleted_at', 'gr_num'], 'safe'],
                [['payment_type', 'payment_status', 'status'], 'string'],
                [['total_item_purchase_amount', 'total_item_vat_amount', 'total_item_discount_amount', 'discount_percent', 'discount_amount', 'roundoff_amount', 'net_amount', 'before_disc_amount', 'after_disc_amount'], 'number'],
                [['purchase_code', 'invoice_no'], 'string', 'max' => 50],
                [['invoice_no'], 'unique', 'targetAttribute' => ['invoice_no', 'tenant_id', 'gr_num'], 'message' => 'Invoice No / GR No has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'purchase_id' => 'Purchase ID',
            'tenant_id' => 'Tenant ID',
            'purchase_code' => 'Purchase Code',
            'invoice_date' => 'Invoice Date',
            'invoice_no' => 'Invoice No',
            'payment_type' => 'Payment Type',
            'supplier_id' => 'Supplier',
            'total_item_purchase_amount' => 'Total Item Purchase Amount',
            'total_item_vat_amount' => 'Total Item Vat Amount',
            'total_item_discount_amount' => 'Total Item Discount Amount',
            'discount_percent' => 'Discount Percent',
            'discount_amount' => 'Discount Amount',
            'roundoff_amount' => 'Roundoff Amount',
            'net_amount' => 'Net Amuont',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
            'gr_num' => 'Goods Received Number'
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
    public function getPhaPurchaseItems() {
        return $this->hasMany(PhaPurchaseItem::className(), ['purchase_id' => 'purchase_id'])->andWhere("pha_purchase_item.deleted_at = '0000-00-00 00:00:00'");
    }

    /**
     * @return ActiveQuery
     */
    public function getPhaPurchaseBillings() {
        return $this->hasMany(PhaPurchaseBilling::className(), ['purchase_id' => 'purchase_id']);
    }

    public function getPhaPurchaseBillingsTotalPaidAmount() {
        return $this->hasMany(PhaPurchaseBilling::className(), ['purchase_id' => 'purchase_id'])->sum('paid_amount');
    }

    public static function find() {
        return new PhaPurchaseQuery(get_called_class());
    }

    public function beforeSave($insert) {
        if ($insert) {
            $this->purchase_code = CoInternalCode::generateInternalCode('PU', 'common\models\PhaPurchase', 'purchase_code');
            $this->gr_num = CoInternalCode::generateInternalCode('PG', 'common\models\PhaPurchase', 'gr_num');
            //Payment Type - Credit - Then payment status is pending.
            if ($this->payment_type == 'CR') {
                $this->payment_status = 'P';
            }
        }
        return parent::beforeSave($insert);
    }

    public function fields() {
        $extend = [
            'supplier' => function ($model) {
                return (isset($model->supplier) ? $model->supplier : '-');
            },
            'supplier_name' => function ($model) {
                return (isset($model->supplier) ? $model->supplier->supplier_name : '-');
            },
            'payment_type_name' => function ($model) {
                if ($model->payment_type == 'CA')
                    return "Cash";
                elseif ($model->payment_type == 'CR')
                    return "Credit";
            },
            'items' => function ($model) {
                return (isset($model->phaPurchaseItems) ? $model->phaPurchaseItems : '-');
            },
            'billings_total_paid_amount' => function ($model) {
                return (isset($model->phaPurchaseBillingsTotalPaidAmount) ? $model->phaPurchaseBillingsTotalPaidAmount : '0');
            },
            'invoice_no_with_supplier' => function ($model) {
                $invoice_no_with_supplier = $model->invoice_no;

                if ($model->supplier != '')
                    $invoice_no_with_supplier .= ' ' . '(' . $model->supplier->supplier_name . ')' . ' ';

                return $invoice_no_with_supplier;
            },
            'billings_total_balance_amount' => function ($model) {
                $paid_amount = 0;
                if (isset($model->phaPurchaseBillingsTotalPaidAmount)) {
                    $paid_amount = $model->phaPurchaseBillingsTotalPaidAmount;
                }

                $balance = $model->net_amount - $paid_amount;
                return $balance;
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'purchasereport':
                    $addt_keys = ['supplier_name'];
                    $parent_fields = [
                        'gr_num' => 'gr_num',
                        'invoice_no' => 'invoice_no',
                        'net_amount' => 'net_amount',
                        'payment_type' => 'payment_type',
                        'invoice_date' => 'invoice_date',
                    ];
                    break;
                case 'purchasevatreport':
                    $addt_keys = ['supplier_name'];
                    $parent_fields = [
                        'invoice_no' => 'invoice_no',
                        'total_item_purchase_amount' => 'total_item_purchase_amount',
                        'total_item_vat_amount' => 'total_item_vat_amount',
                        'net_amount' => 'net_amount',
                        'payment_type' => 'payment_type',
                        'invoice_date' => 'invoice_date',
                    ];
                    break;
                case 'viewlist':
                    $addt_keys = ['supplier_name', 'items', 'billings_total_paid_amount', 'billings_total_balance_amount'];
                    $pFields = ['invoice_no', 'gr_num', 'invoice_date', 'total_item_purchase_amount', 'total_item_vat_amount', 'discount_percent', 'discount_amount', 'roundoff_amount', 'net_amount', 'purchase_id', 'payment_type', 'payment_status'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'purchase_update':
                    $addt_keys = ['supplier_name', 'items'];
                    $pFields = ['invoice_no', 'supplier_id', 'invoice_date', 'purchase_id','payment_type'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'purchase_bill_search':
                    $addt_keys = ['invoice_no_with_supplier'];
                    $parent_fields = [
                        'purchase_id' => 'purchase_id',
                        'invoice_no' => 'invoice_no',
                    ];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            CoInternalCode::increaseInternalCode("PU");
        }

        if ($this->after_save) {
            //Sale Billing - Payment Type - CASH
            if ($this->payment_type == 'CA') {
                if ($insert) {
                    $purchase_billing_model = new PhaPurchaseBilling();
                } else {
                    $purchase_billing_model = PhaPurchaseBilling::find()->where(['purchase_id' => $this->purchase_id])->one();
                    if (empty($purchase_billing_model))
                        $purchase_billing_model = new PhaPurchaseBilling();
                }

                $purchase_billing_model->purchase_id = $this->purchase_id;
                $purchase_billing_model->paid_date = $this->invoice_date;
                $purchase_billing_model->paid_amount = $this->net_amount;
                $purchase_billing_model->save(false);
            }
            if ($insert)
                $activity = 'Purchase Created Successfully (#' . $this->invoice_no . ' )';
            else
                $activity = 'Purchase Updated Successfully (#' . $this->invoice_no . ' )';
            CoAuditLog::insertAuditLog(PhaPurchase::tableName(), $this->purchase_id, $activity);
        }
        return parent::afterSave($insert, $changedAttributes);
    }

    public function getProductItemIds() {
        return ArrayHelper::map($this->phaPurchaseItems, 'purchase_item_id', 'purchase_item_id');
    }

}
