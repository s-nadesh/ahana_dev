<?php

namespace common\models;

use common\models\query\CoChargePerCategoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_charge_per_category".
 *
 * @property integer $charge_id
 * @property integer $tenant_id
 * @property string $charge_cat_type
 * @property integer $charge_cat_id
 * @property integer $charge_code_id
 * @property string $charge_default
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoChargePerCategory extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_charge_per_category';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['charge_code_id', 'charge_cat_id'], 'required'],
                [['tenant_id', 'charge_cat_id', 'charge_code_id', 'created_by', 'modified_by'], 'integer'],
                [['charge_cat_type'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['charge_default'], 'string', 'max' => 255],
//            [['charge_cat_id', 'charge_code_id', 'tenant_id'], 'unique', 'message' => 'The combination has already been taken.'],
            [['charge_cat_id'], 'unique', 'targetAttribute' => ['charge_cat_id', 'charge_code_id', 'tenant_id'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'charge_id' => 'Charge ID',
            'tenant_id' => 'Tenant ID',
            'charge_cat_type' => 'Charge Cat Type',
            'charge_cat_id' => 'Category',
            'charge_code_id' => 'Code/Names',
            'charge_default' => 'Default',
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
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoChargePerCategoryQuery(get_called_class());
    }

    /**
     * @return ActiveQuery
     */
    public function getRoomchargecategory() {
        return $this->hasOne(CoRoomChargeCategory::className(), ['charge_cat_id' => 'charge_cat_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRoomchargesubcategory() {
        return $this->hasOne(CoRoomChargeSubcategory::className(), ['charge_subcat_id' => 'charge_code_id']);
    }

    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'charge_code_id']);
    }

    public function getCoChargePerSubcategories() {
        return $this->hasMany(CoChargePerSubcategory::className(), ['charge_id' => 'charge_id']);
    }

    public function getOpCoChargePerSubcategories() {
        return $this->hasMany(CoChargePerSubcategory::className(), ['charge_id' => 'charge_id'])->andWhere(['charge_type' => 'OP']);
    }

    public function getIpCoChargePerSubcategories() {
        return $this->hasMany(CoChargePerSubcategory::className(), ['charge_id' => 'charge_id'])->andWhere(['charge_type' => 'IP']);
    }

    public function fields() {
        $extend = [
            'charge_cat_name' => function ($model) {
                if ($model->charge_cat_type == 'C')
                    return (isset($model->roomchargecategory) ? $model->roomchargecategory->charge_cat_name : '-');
                if ($model->charge_cat_type == 'P' && $model->charge_cat_id == -1)
                    return 'Professional Charge';
            },
            'charge_code_name' => function ($model) {
                if ($model->charge_cat_type == 'C')
                    return (isset($model->roomchargesubcategory) ? $model->roomchargesubcategory->charge_subcat_name : '-');
                if ($model->charge_cat_type == 'P' && $model->charge_cat_id == -1)
                    return (isset($model->user) ? $model->user->name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    /* charge_code_id - consultant_id (user_id) */

    public static function getConsultantCharges($charge_code_id, $type = 'P', $charge_cat_id = '-1') {
        if ($charge_code_id) {
            $response = self::find()->tenant()->chargeCatType($type)->chargeCatId($charge_cat_id)->andWhere(['charge_code_id' => $charge_code_id])->one();
            if (!empty($response)) {
                $op = $response->opCoChargePerSubcategories;
                if (!empty($response->charge_default))
                    $op[] = ["charge_id" => $response->charge_id, "charge_type" => "OP", "charge_amount" => $response->charge_default, "op_dept" => "Default", 'patient_cat_id' => 0];

                return $op;
            }
        }
    }

    // $charge_cat_id = 1 for Procedures
    // $charge_cat_id = 2 for Allied Charge
    // $charge_cat_id = -1 for Professional

    public static function getChargeAmount($charge_cat_id, $type, $charge_code_id, $charge_type, $charge_link_id) {
        $amount = 0;
        if ($charge_code_id) {
            $response = self::find()->tenant()->chargeCatType($type)->chargeCatId($charge_cat_id)->andWhere(['charge_code_id' => $charge_code_id])->one();

            if (!empty($response)) {
                if ($charge_type == 'IP')
                    $categories = $response->ipCoChargePerSubcategories;
                else
                    $categories = $response->opCoChargePerSubcategories;

                if (!empty($categories))
                    $amount = self::_get_amount($categories, $charge_link_id);

                if (empty($amount) && $amount == 0)
                    $amount = $response->charge_default;
            }
        }
        return $amount;
    }

    private static function _get_amount($categories, $charge_link_id) {
        $amount = 0;
        foreach ($categories as $key => $category) {
            //Record inserted two time, to avoid 0.00 "&&" condition used in IF statement.
            if ($category->charge_link_id == $charge_link_id && $category->charge_amount != '0.00') {
                $amount = $category->charge_amount;
                break;
            }
        }
        return $amount;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($this->charge_cat_id != -1) {
            $roomchargecategory = CoRoomChargeCategory::find()->where(['charge_cat_id' => $this->charge_cat_id])->one();
            $roomchargesubcategory = CoRoomChargeSubcategory::find()->where(['charge_cat_id' => $this->charge_cat_id, 'charge_subcat_id' => $this->charge_code_id])->one();
            if ($insert)
                $activity = "Charge for Category Added Successfully (#$roomchargecategory->charge_cat_name,$roomchargesubcategory->charge_subcat_name)";
            else
                $activity = "Charge for Category Updated Successfully (#$roomchargecategory->charge_cat_name,$roomchargesubcategory->charge_subcat_name)";
        }
        if ($this->charge_cat_id == -1) {
            $user = CoUser::find()->where(['user_id' => $this->charge_code_id])->one();
            if ($insert)
                $activity = "Charge for Category Added Successfully (#Professional Charges,$user->name)";
            else
                $activity = "Charge for Category Updated Successfully (#Professional Charges,$user->name)";
        }
        CoAuditLog::insertAuditLog(CoChargePerCategory::tableName(), $this->charge_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
