<?php

namespace common\models;

use common\models\query\PhaSaleReturnQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "pha_sale_return".
 *
 * @property integer $sale_ret_id
 * @property integer $tenant_id
 * @property string $bill_no
 * @property integer $patient_id
 * @property integer $sale_id
 * @property string $patient_name
 * @property string $mobile_no
 * @property string $sale_date
 * @property string $sale_return_date
 * @property string $total_item_vat_amount
 * @property string $total_item_sale_amount
 * @property string $total_item_discount_percent
 * @property string $total_item_discount_amount
 * @property string $total_item_amount
 * @property string $roundoff_amount
 * @property string $bill_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property PatPatient $patient
 * @property PhaSale $sale
 * @property PhaSaleReturnItem[] $phaSaleReturnItems
 */
class PhaSaleReturn extends RActiveRecord {

    public $noitem = false;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_sale_return';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['sale_return_date'], 'required'],
                [['tenant_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['sale_date', 'sale_return_date', 'created_at', 'modified_at', 'deleted_at', 'sale_id', 'patient_name', 'total_item_vat_amount'], 'safe'],
                [['total_item_sale_amount', 'total_item_discount_percent', 'total_item_discount_amount', 'total_item_amount', 'roundoff_amount', 'bill_amount', 'total_item_vat_amount'], 'number'],
                [['status'], 'string'],
                [['bill_no', 'mobile_no'], 'string', 'max' => 50],
                [['noitem'], 'validateNoitem'],
        ];
    }

    public function validateNoitem($attribute, $params) {
        if ($this->noitem)
            $this->addError($attribute, "Select atleast one item to return");
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'sale_ret_id' => 'Sale Ret ID',
            'tenant_id' => 'Tenant ID',
            'bill_no' => 'Bill No',
            'patient_id' => 'Patient ID',
            'mobile_no' => 'Mobile No',
            'sale_date' => 'Sale Date',
            'sale_return_date' => 'Sale Return Date',
            'total_item_vat_amount' => 'Total Item VAT Amount',
            'total_item_sale_amount' => 'Total Item Sale Amount',
            'total_item_discount_percent' => 'Total Item Discount Percent',
            'total_item_discount_amount' => 'Total Item Discount Amount',
            'total_item_amount' => 'Total Item Amount',
            'roundoff_amount' => 'Roundoff Amount',
            'bill_amount' => 'Bill Amount',
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
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
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
    public function getPhaSaleReturnItems() {
        return $this->hasMany(PhaSaleReturnItem::className(), ['sale_ret_id' => 'sale_ret_id']);
    }

    public function beforeSave($insert) {
        if ($insert) {
            $this->bill_no = CoInternalCode::generateInternalCode('SR', 'common\models\PhaSaleReturn', 'bill_no');
        }

        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            CoInternalCode::increaseInternalCode("B");
            $activity = 'Sales Return Created Successfully (#' . $this->bill_no . ' )';
        } else
            $activity = 'Sales Return Updated Successfully (#' . $this->bill_no . ' )';
        CoAuditLog::insertAuditLog(PhaSaleReturn::tableName(), $this->sale_ret_id, $activity);
        $post = Yii::$app->getRequest()->post();
        if (($this->sale->payment_type == 'CR') || ($this->sale->payment_type == 'COD')) {
            $billing_model = PhaSaleBilling::find()->tenant()->andWhere(['sale_ret_id' => $this->sale_ret_id])->one();
            if (empty($billing_model)) {
                $billing_model = new PhaSaleBilling();
            }
            $billing_model->sale_id = $this->sale_id;
            $billing_model->sale_ret_id = $this->sale_ret_id;
            if (isset($post['creditbillamount']) && !empty($post['creditbillamount'])) {
                $billing_model->paid_amount = $post['creditbillamount'];
            } else {
                $billing_model->paid_amount = $post['bill_amount'];
            }
            $billing_model->paid_date = date('Y-m-d');
            $billing_model->save();
        }
        return parent::afterSave($insert, $changedAttributes);
    }

    public static function find() {
        return new PhaSaleReturnQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'patient' => function ($model) {
                return (isset($model->patient) ? $model->patient : '-');
            },
            'patient_uhid' => function ($model) {
                return (isset($model->patient) ? $model->patient->patient_global_int_code : '-');
            },
            'patient_name' => function ($model) {
                return (isset($model->patient) ? ucwords("{$model->patient->patient_title_code} {$model->patient->patient_firstname}") : '-');
            },
            'items' => function ($model) {
                return (isset($model->phaSaleReturnItems) ? $model->phaSaleReturnItems : '-');
            },
            'sale_date' => function ($model) {
                return (isset($model->sale) ? $model->sale->sale_date : '-');
            },
            'sale_bill_no' => function ($model) {
                return (isset($model->sale) ? $model->sale->bill_no : '-');
            },
            'sale_payment_type' => function ($model) {
                if (isset($model->sale)) {
                    if ($model->sale->payment_type == 'CA')
                        return 'Cash';
                    if ($model->sale->payment_type == 'CR')
                        return 'Credit';
                    else
                        return 'Cash On Delivery';
                } else {
                    return '-';
                }
            },
            'sale_group_name' => function ($model) {
                return (isset($model->sale) ? $model->sale->patient_group_name : '-');
            },
            'billed_by' => function ($model) {
                return $model->createdUser->title_code . ' ' . $model->createdUser->name;
            },
            'branch_address' => function ($model) {
                return (isset($model->tenant->tenant_address) ? $model->tenant->tenant_address : '-');
            },
            'branch_phone' => function ($model) {
                return (isset($model->tenant->tenant_contact1) ? $model->tenant->tenant_contact1 : '-');
            },
        ];
        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'sale_return_list':
                    $addt_keys = ['patient', 'items', 'sale_bill_no', 'sale_payment_type'];
                    $parent_fields = [
                        'sale_ret_id' => 'sale_ret_id',
                        'sale_id' => 'sale_id',
                        'bill_no' => 'bill_no',
                        'sale_date' => 'sale_date',
                        'sale_return_date' => 'sale_return_date',
                        'created_at' => 'created_at',
                        'total_item_sale_amount' => 'total_item_sale_amount',
                        'total_item_discount_amount' => 'total_item_discount_amount',
                        'roundoff_amount' => 'roundoff_amount',
                        'bill_amount' => 'bill_amount',
                    ];
                    break;
                case 'salereturnreport':
                    $addt_keys = ['patient_name', 'patient_uhid', 'sale_payment_type', 'sale_group_name'];
                    $parent_fields = [
                        'bill_no' => 'bill_no',
                        'bill_amount' => 'bill_amount',
                        'sale_date' => 'sale_date',
                        'sale_return_date' => 'sale_return_date',
                    ];
                    break;
                case 'sale_list':
                    $addt_keys = ['patient_name'];
                    $parent_fields = [
                        'bill_no' => 'bill_no',
                        'bill_amount' => 'bill_amount',
                        'sale_return_date' => 'sale_return_date',
                    ];
                    break;
            endswitch;
        }
        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;
        return array_merge($parent_fields, $extFields);
    }

    public function getSaleReturnItemIds() {
        return ArrayHelper::map($this->phaSaleReturnItems, 'sale_ret_item_id', 'sale_ret_item_id');
    }

}
