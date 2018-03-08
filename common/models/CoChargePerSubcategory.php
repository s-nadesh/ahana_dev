<?php

namespace common\models;

use common\models\query\CoChargePerSubcategoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_charge_per_subcategory".
 *
 * @property integer $sub_charge_id
 * @property integer $charge_id
 * @property string $charge_type
 * @property integer $charge_link_id
 * @property string $charge_amount
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 *
 * @property CoChargePerCategory $charge
 */
class CoChargePerSubcategory extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_charge_per_subcategory';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['charge_id', 'charge_type', 'charge_link_id', 'charge_amount'], 'required'],
                [['charge_id', 'charge_link_id', 'created_by', 'modified_by'], 'integer'],
                [['charge_type'], 'string'],
                [['charge_amount'], 'number'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'sub_charge_id' => 'Sub Charge ID',
            'charge_id' => 'Charge ID',
            'charge_type' => 'Charge Type',
            'charge_link_id' => 'Charge Link ID',
            'charge_amount' => 'Charge Amount',
            'created_at' => 'Created At',
            'created_by' => 'Created By',
            'modified_at' => 'Modified At',
            'modified_by' => 'Modified By',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCharge() {
        return $this->hasOne(CoChargePerCategory::className(), ['charge_id' => 'charge_id']);
    }

    public static function find() {
        return new CoChargePerSubcategoryQuery(get_called_class());
    }

    public static function getChargePerSubCateogrylist($deleted = false, $cat_id = null) {
        if (!$deleted)
            $list = self::find()->active()->categoryid($cat_id)->all();
        else
            $list = self::find()->deleted()->categoryid($cat_id)->all();

        return $list;
    }

    /**
     * @return ActiveQuery
     */
    public function getOutpatient() {
        return $this->hasOne(CoPatientCategory::className(), ['patient_cat_id' => 'charge_link_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getInpatient() {
        return $this->hasOne(CoRoomType::className(), ['room_type_id' => 'charge_link_id']);
    }

    public function fields() {
        $extend = [
            'op_dept' => function ($model) {
                return (isset($model->outpatient) ? $model->outpatient->patient_cat_name : '-');
            },
            'ip_dept' => function ($model) {
                return (isset($model->inpatient) ? $model->inpatient->room_type_name : '-');
            },
            'patient_cat_id' => function ($model) {
                return (isset($model->outpatient) ? $model->outpatient->patient_cat_id : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($this->charge_type == 'OP') {
            $patcategory = CoPatientCategory::find()->where(['patient_cat_id' => $this->charge_link_id])->one();
            if ($insert)
                $activity = "Charge for Category Added Successfully (#outpatient,$patcategory->patient_cat_name)";
            else
                $activity = "Charge for Category Updated Successfully (#outpatient,$patcategory->patient_cat_name)";
        }
        if ($this->charge_type == 'IP') {
            $roomType = CoRoomType::find()->where(['room_type_id' => $this->charge_link_id])->one();
            if ($insert)
                $activity = "Charge for Category Added Successfully (#Inpatient,$roomType->room_type_name)";
            else
                $activity = "Charge for Category Updated Successfully (#Inpatient,$roomType->room_type_name)";
        }
        CoAuditLog::insertAuditLog(CoChargePerSubcategory::tableName(), $this->sub_charge_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
