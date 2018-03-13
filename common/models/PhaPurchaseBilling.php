<?php

namespace common\models;

use common\models\query\PhaPurchaseBillingQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_purchase_billing".
 *
 * @property integer $purchase_billing_id
 * @property integer $purchase_id
 * @property integer $tenant_id
 * @property string $paid_date
 * @property string $paid_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PhaPurchaseBilling extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_purchase_billing';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['purchase_id', 'paid_date', 'paid_amount'], 'required'],
            [['purchase_id', 'tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['paid_date', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['paid_amount'], 'number'],
            [['status'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'purchase_billing_id' => 'Purchase Billing ID',
            'purchase_id' => 'Purchase ID',
            'tenant_id' => 'Tenant ID',
            'paid_date' => 'Paid Date',
            'paid_amount' => 'Paid Amount',
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
    public function getPurchase() {
        return $this->hasOne(PhaPurchase::className(), ['purchase_id' => 'purchase_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public static function find() {
        return new PhaPurchaseBillingQuery(get_called_class());
    }
    
    public function afterSave($insert, $changedAttributes) {
        $bill_amount = $this->purchase->net_amount;
        $billings_total = $this->find()->where(['purchase_id' => $this->purchase_id])->sum('paid_amount');

        $purchase_model = $this->purchase;
        if ($bill_amount == $billings_total) {
            $purchase_model->payment_status = 'C';
        } elseif ($billings_total > 0) {
            $purchase_model->payment_status = 'PC';
        }
        $purchase_model->after_save = false;
        $purchase_model->save(false);

        return parent::afterSave($insert, $changedAttributes);
    }

}
