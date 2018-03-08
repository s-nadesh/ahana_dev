<?php

namespace common\models;

use common\models\query\PatBillingPaymentQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_billing_payment".
 *
 * @property integer $payment_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $payment_date
 * @property string $payment_amount
 * @property string $payment_mode
 * @property string $card_type
 * @property integer $card_number
 * @property string $bank_name
 * @property string $bank_number
 * @property string $bank_date
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property CoTenant $tenant
 */
class PatBillingPayment extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_billing_payment';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['payment_date', 'payment_amount', 'payment_mode'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['payment_date', 'created_at', 'modified_at', 'deleted_at', 'card_type', 'card_number', 'bank_name', 'bank_number', 'bank_date', 'category', 'ref_no'], 'safe'],
                [['payment_amount'], 'number'],
                [['payment_mode', 'status'], 'string'],
                [['card_type', 'card_number'], 'required', 'when' => function($model) {
                    return $model->payment_mode == 'CD';
                }],
                [['bank_name', 'bank_number', 'bank_date'], 'required', 'when' => function($model) {
                    return $model->payment_mode == 'CH';
                }],
                [['bank_name', 'ref_no', 'bank_date'], 'required', 'when' => function($model) {
                    return ($model->payment_mode == 'ON');
                }],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'payment_id' => 'Payment ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'payment_date' => 'Date of Payment',
            'payment_amount' => 'Amount Paid',
            'category' => 'Category',
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
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatBillingPaymentQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Billing Payment Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Billing Payment Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatBillingPayment::tableName(), $this->payment_id, $activity);
    }

    public function fields() {
        $extend = [
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
            'patient_name' => function ($model) {
                return (isset($model->encounter) ? $model->encounter->patient->fullname : '-');
            },
            'patient_uhid' => function ($model) {
                return (isset($model->encounter) ? $model->encounter->patient->patGlobalPatient->patient_global_int_code : '-');
            },
            'payment' => function ($model) {
                if (isset($model->payment_mode)) {
                    if ($model->payment_mode == 'CA') {
                        return 'Cash';
                    } elseif ($model->payment_mode == 'CD') {
                        return 'Card';
                    } elseif ($model->payment_mode == 'ON') {
                        return 'Online';
                    } else {
                        return 'Cheque';
                    }
                } else {
                    return '-';
                }
            },
            'created_by_name' => function ($model) {
                return (isset($model->createdUser) ? $model->createdUser->title_code . ucfirst($model->createdUser->name) : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
