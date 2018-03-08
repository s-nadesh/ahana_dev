<?php

namespace common\models;

use common\models\query\PatBillingExtraConcessionQuery;
use yii\db\ActiveQuery;
use yii\helpers\BaseInflector;

/**
 * This is the model class for table "pat_billing_extra_concession".
 *
 * @property integer $ec_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $ec_type
 * @property integer $link_id
 * @property string $extra_amount
 * @property string $concession_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatBillingExtraConcession extends RActiveRecord {

    public $mode;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_billing_extra_concession';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_id', 'patient_id', 'ec_type', 'link_id'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'link_id', 'created_by', 'modified_by'], 'integer'],
                [['ec_type', 'status'], 'string'],
                [['extra_amount', 'concession_amount'], 'number'],
                [['created_at', 'modified_at', 'deleted_at', 'mode'], 'safe'],
                [['extra_amount', 'concession_amount'], 'validateAmount'],
                [['extra_amount'], 'validateMinAmount'],
                [['concession_amount'], 'validateMaxAmount'],
        ];
    }

    public function validateAmount($attribute, $params) {
        $attribute_name = ($this->mode == 'E') ? 'extra_amount' : 'concession_amount';
        $name = BaseInflector::camel2words($attribute_name);

        if ($this->$attribute_name < 0 && $attribute_name == $attribute) {
            $this->addError($attribute, "{$name} should be greater than 0");
        }
    }

    public function validateMinAmount($attribute, $params) {
        $view = ($this->ec_type == 'P') ? 'common\models\VBillingProcedures' : 'common\models\VBillingProfessionals';
        $nonRecurr = $view::find()->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id,
                    'patient_id' => $this->patient_id,
                    'category_id' => $this->link_id
                ])->one();

        if (!empty($nonRecurr)) {
            $attribute_name = ($this->mode == 'E') ? 'extra_amount' : 'concession_amount';
            $name = BaseInflector::camel2words($attribute_name);

            $total = $nonRecurr->total_charge + $this->extra_amount;
            if ($this->concession_amount > $total && $attribute_name == $attribute) {
                $this->addError($attribute, "Net Amount (Charge + Extra) should be greater than Concession amount");
            }
        }
    }

    public function validateMaxAmount($attribute, $params) {
        $view = ($this->ec_type == 'P') ? 'common\models\VBillingProcedures' : 'common\models\VBillingProfessionals';
        $nonRecurr = $view::find()->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id,
                    'patient_id' => $this->patient_id,
                    'category_id' => $this->link_id
                ])->one();

        if (!empty($nonRecurr)) {
            $attribute_name = ($this->mode == 'E') ? 'extra_amount' : 'concession_amount';
            $name = BaseInflector::camel2words($attribute_name);
            $total = $nonRecurr->total_charge + $nonRecurr->extra_amount;
            if ($this->$attribute_name > $total && $attribute_name == $attribute) {
                $this->addError($attribute, "{$name} should be lesser than Net (Charge + Extra) Amount ({$total})");
            }
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'ec_id' => 'Ec ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'ec_type' => 'Ec Type',
            'link_id' => 'Link ID',
            'extra_amount' => 'Extra Amount',
            'concession_amount' => 'Concession Amount',
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
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    public function getRoomchargesubcategory() {
        return $this->hasOne(CoRoomChargeSubcategory::className(), ['charge_subcat_id' => 'link_id']);
    }

    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'link_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatBillingExtraConcessionQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        $this->_insertBillingLog($insert, $changedAttributes);
        return parent::afterSave($insert, $changedAttributes);
    }

    private function _insertBillingLog($insert, $changedAttributes) {
        if ($this->ec_type == 'C') {
            $header = 'Professional Charges ( ' . $this->user->title_code . ' ' . $this->user->name . ')';
        } else {
            $header = 'Procedure Charges ( ' . $this->roomchargesubcategory->charge_subcat_name. ')';
        }

        if ($this->mode == 'E') {
            $amount = number_format($this->extra_amount, 2);
            $activity = "Extra Amount {$amount}";
            if($changedAttributes['extra_amount'] == '0.00' || $changedAttributes['extra_amount'] == '')
                $activity .= ' ( Add )';
            else 
                $activity .= ' ( Edit )';
        } else {
            $amount = number_format($this->concession_amount, 2);
            $activity = "Concession Amount {$amount}";
            if($changedAttributes['concession_amount'] == '0.00' || $changedAttributes['concession_amount'] == '')
                $activity .= ' ( Add )';
            else 
                $activity .= ' ( Edit )';
        }
        
        PatBillingLog::insertBillingLog($this->patient_id, $this->encounter_id, $this->modified_at, 'N', $header, $activity);
    }

    public function fields() {
        $extend = [
            'link' => function ($model) {
                switch ($this->ec_type) {
                    case 'P':
                        return $this->roomchargesubcategory;
                        break;
                    case 'C':
                        return $this->user;
                        break;
                }
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
